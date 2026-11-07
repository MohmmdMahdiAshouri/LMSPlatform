using System.Reflection;
using LMS.Shared.Application.Behaviors;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Shared.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddLmsCqrs(
        this IServiceCollection services,
        params Assembly[] assemblies)
    {
        var targetAssemblies = assemblies.Length > 0
            ? assemblies.ToList()
            : DiscoverLmsAssemblies();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblies(targetAssemblies.ToArray());
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        var eventRegistry = new Services.EventRegistry();
        foreach (var assembly in targetAssemblies)
        {
            try
            {
                var eventTypes = assembly.GetTypes()
                    .Where(t => !t.IsAbstract && !t.IsInterface && typeof(LMS.Shared.Domain.Events.IDomainEvent).IsAssignableFrom(t));

                foreach (var eventType in eventTypes)
                {
                    eventRegistry.Register(eventType.Name, eventType);
                }
            }
            catch
            {
                // Ignore type load errors for assemblies with optional dependencies
            }
        }

        services.AddSingleton<Abstractions.IEventRegistry>(eventRegistry);
        services.AddScoped<Abstractions.IEventDispatcher, Services.EventDispatcher>();

        return services;
    }

    private static List<Assembly> DiscoverLmsAssemblies()
    {
        var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => !a.IsDynamic && a.GetName().Name?.StartsWith("LMS.") == true)
            .ToList();

        var loadedNames = loadedAssemblies
            .Select(a => a.GetName().Name!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var binDirectory = AppContext.BaseDirectory;
        foreach (var dllPath in Directory.GetFiles(binDirectory, "LMS.*.dll"))
        {
            var fileName = Path.GetFileNameWithoutExtension(dllPath);
            if (!loadedNames.Contains(fileName))
            {
                try
                {
                    var loaded = Assembly.LoadFrom(dllPath);
                    loadedAssemblies.Add(loaded);
                    loadedNames.Add(fileName);
                }
                catch
                {
                    // Ignore load errors for non-.NET or invalid assemblies
                }
            }
        }

        return loadedAssemblies;
    }
}
