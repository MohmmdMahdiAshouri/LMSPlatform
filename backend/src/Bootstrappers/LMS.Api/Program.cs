using LMS.Shared.ErrorHandling;
using LMS.Shared.ResponseHandling;
using LMS.Shared.Common.Correlation;
using Scalar.AspNetCore;
using Serilog;
using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using LMS.Shared.Application;
using LMS.Shared.Common.Errors;
using LMS.Shared.Common.Primitives;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Abstractions;
using LMS.Identity.Authentication.Infrastructure;
using LMS.Identity.Authentication.WebApi;
using LMS.Shared.Infrastructure;
using LMS.Shared.Infrastructure.BackgroundJobs;
using Microsoft.AspNetCore.Mvc;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

    var otlpEndpoint = builder.Configuration["OpenTelemetry:Endpoint"] ?? "http://localhost:18889";
    var serviceName = builder.Configuration["OpenTelemetry:ServiceName"] ?? "LMS.Api";

    builder.Host.UseSerilog((ctx, lc) =>
    {
        lc.ReadFrom.Configuration(ctx.Configuration)
          .Enrich.FromLogContext()
          .Enrich.WithProperty("service.name", serviceName)
          .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
          .WriteTo.OpenTelemetry(options =>
          {
              options.Endpoint = otlpEndpoint;
              options.Protocol = Serilog.Sinks.OpenTelemetry.OtlpProtocol.Grpc;
              options.ResourceAttributes = new Dictionary<string, object>
              {
                  ["service.name"] = serviceName
              };
          });
    });

    // OpenTelemetry Tracing & Metrics for Aspire Dashboard
    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource.AddService(serviceName))
        .WithTracing(tracing =>
        {
            tracing.AddAspNetCoreInstrumentation(opts =>
            {
                opts.RecordException = true;
            })
            .AddHttpClientInstrumentation()
            .AddOtlpExporter(opts =>
            {
                opts.Endpoint = new Uri(otlpEndpoint);
            });
        })
        .WithMetrics(metrics =>
        {
            metrics.AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddOtlpExporter(opts =>
                {
                    opts.Endpoint = new Uri(otlpEndpoint);
                });
        });

    // 1. Controllers & Documentation
    builder.Services.AddControllers();
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, cancellationToken) =>
        {
            document.Components ??= new Microsoft.OpenApi.OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();
            var scheme = new Microsoft.OpenApi.OpenApiSecurityScheme
            {
                Type = Microsoft.OpenApi.SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter your JWT Access Token to authorize requests."
            };
            document.Components.SecuritySchemes["Bearer"] = scheme;

            var req = new Microsoft.OpenApi.OpenApiSecurityRequirement
            {
                [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
            };
            document.Security = new List<Microsoft.OpenApi.OpenApiSecurityRequirement> { req };
            return Task.CompletedTask;
        });
    });

    builder.Services.AddFluentValidationAutoValidation();

    // Auto-discover and register all validators across all LMS modules/assemblies
    var lmsAssemblies = Directory.GetFiles(AppContext.BaseDirectory, "LMS.*.dll")
        .Select(file =>
        {
            try { return Assembly.LoadFrom(file); }
            catch { return null; }
        })
        .Where(a => a != null)
        .Distinct()
        .ToList();

    builder.Services.AddValidatorsFromAssemblies(lmsAssemblies!);

    // CQRS with MediatR & Pipeline Behaviors (Logging, Validation)
    builder.Services.AddLmsCqrs();
    builder.Services.AddSingleton<ISystemClock, SystemClock>();

    // 2. Shared Infrastructure (Hangfire, Transactional Outbox, Interceptor & Background Processor)
    builder.Services.AddLmsSharedInfrastructure(builder.Configuration);

    // Authentication Infrastructure (DbContext, Repositories, PasswordHasher)
    builder.Services.AddAuthenticationInfrastructure(builder.Configuration);
    builder.Services.AddAuthenticationWebApi();

    builder.Services.Configure<ApiBehaviorOptions>(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

            var correlationId = context.HttpContext.GetCorrelationId();
            var userIP = context.HttpContext.Connection.RemoteIpAddress?.ToString();

            var error = Error.Validation("One or more validation failures have occurred.", errors);
            var envelope = ApiEnvelope.FromError(error, correlationId, userIP);

            return new BadRequestObjectResult(envelope);
        };
    });

    // 2. Cross-cutting concerns: Shared Error Handling & Response Envelope
    builder.Services.AddLmsErrorHandling(DbProvider.SqlServer);
    builder.Services.AddLmsResponseHandling();
    builder.Services.AddProblemDetails();

    // 3. CORS
    builder.Services.AddCors(opts =>
    {
        opts.AddDefaultPolicy(policy => policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
    });

    var app = builder.Build();

    // Middleware Pipeline:
    // Correlation ID -> ExceptionHandler -> ResponseEnvelope -> Endpoints
    app.UseCorrelationId();

    app.UseExceptionHandler();
    app.UseCors();
    app.UseResponseEnvelopeMiddleware();

    // Security Pipeline: Authenticate credentials -> Authorize roles/policies
    app.UseAuthentication();
    app.UseAuthorization();

    app.UseLmsHangfireDashboard();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options.AddPreferredSecuritySchemes("Bearer");
        });
    }

    // Health check endpoint
    app.MapGet("/health", () => Results.Ok(new 
    { 
        status = "healthy", 
        service = "LMS.Api", 
        timestamp = DateTime.UtcNow 
    }));

    // Demo endpoints for verifying Result Pattern & Global Error Handling
    if (app.Environment.IsDevelopment())
    {
        var testGroup = app.MapGroup("/test");

        // 1. Raw return wrapped automatically by ResponseEnvelopeMiddleware
        testGroup.MapGet("/raw-success", () => new { message = "Raw object automatically enveloped", serverTime = DateTime.UtcNow });

        // 2. Result<T> Success using ToApiResponse()
        testGroup.MapGet("/result-success", (HttpContext ctx) =>
        {
            var result = LMS.Shared.Common.Results.Result<string>.Success("Data from Result<T> pattern");
            return result.ToApiResponse(ctx);
        });

        // 3. Result<T> Failure using ToApiResponse()
        testGroup.MapGet("/result-fail", (HttpContext ctx) =>
        {
            var result = LMS.Shared.Common.Results.Result<string>.Failure(
                LMS.Shared.Common.Errors.Error.NotFound("Student", "std_1001"));
            return result.ToApiResponse(ctx);
        });

        // 4. Domain Invariant Violation Exception (422)
        testGroup.MapGet("/domain-exception", () =>
        {
            throw new LMS.Shared.Common.Exceptions.DomainException("Student balance cannot be negative.");
        });

        // 5. Validation Exception (400)
        testGroup.MapGet("/validation-exception", () =>
        {
            throw new LMS.Shared.Common.Exceptions.ValidationException(new Dictionary<string, string[]>
            {
                ["Email"] = ["Email is required.", "Invalid email format."],
                ["Password"] = ["Password must contain at least 8 characters."]
            });
        });

        // 6. Conflict Exception (409)
        testGroup.MapGet("/conflict-exception", () =>
        {
            throw LMS.Shared.Common.Exceptions.ConflictException.Duplicate<object>("NationalCode", "1234567890");
        });

        // 7. InvalidOperationException mapped to 400
        testGroup.MapGet("/unhandled-exception", () =>
        {
            throw new InvalidOperationException("Simulated unexpected system failure!");
        });

        // 8. Unhandled 500 Exception (Fatal / System error)
        testGroup.MapGet("/server-error", () =>
        {
            throw new Exception("Unexpected server crash!");
        });

        // 9. Protected endpoint: requires valid JWT Bearer and tests ICurrentUser resolution
        testGroup.MapGet("/auth-me", (LMS.Shared.Application.Abstractions.Security.ICurrentUser currentUser) =>
        {
            return Results.Ok(new
            {
                isAuthenticated = currentUser.IsAuthenticated,
                userId = currentUser.UserId,
                sessionId = currentUser.SessionId,
                email = currentUser.Email,
                username = currentUser.Username
            });
        }).RequireAuthorization();
    }

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "LMS.Api failed to start");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
