using Hangfire;
using LMS.Shared.Application.Abstractions;
using LMS.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LMS.Shared.Infrastructure.BackgroundJobs;

public sealed class OutboxProcessor(
    IServiceScopeFactory scopeFactory,
    IOptions<OutboxOptions> options,
    IOutboxSignal outboxSignal,
    ILogger<OutboxProcessor> logger) : BackgroundService
{
    private readonly OutboxOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "OutboxProcessor background service started in Hybrid mode (Signal-driven with {FallbackInterval} fallback).",
            _options.FallbackInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // 1. Drain all pending messages in batches until the outbox is clear
                while (!stoppingToken.IsCancellationRequested)
                {
                    var processedCount = await ProcessBatchAsync(stoppingToken);
                    if (processedCount < _options.BatchSize)
                    {
                        break;
                    }
                }

                // 2. Wait until awakened by a post-commit signal OR fallback timer
                await outboxSignal.WaitAsync(_options.FallbackInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred while processing outbox messages. Waiting 5s before retrying.");
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        logger.LogInformation("OutboxProcessor background service stopped.");
    }

    private async Task<int> ProcessBatchAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var outboxDbContexts = scope.ServiceProvider.GetServices<IOutboxDbContext>();

        var totalProcessed = 0;

        foreach (var outboxDbContext in outboxDbContexts)
        {
            var messages = await outboxDbContext.OutboxMessages
                .Where(m => m.ProcessedAt == null && m.Attempts < _options.MaxAttempts)
                .OrderBy(m => m.CreatedAt)
                .Take(_options.BatchSize)
                .ToListAsync(cancellationToken);

            if (messages.Count == 0)
            {
                continue;
            }

            logger.LogInformation("OutboxProcessor picked up {Count} pending outbox message(s).", messages.Count);

            foreach (var message in messages)
            {
                try
                {
                    BackgroundJob.Enqueue<IEventDispatcher>(dispatcher =>
                        dispatcher.DispatchAsync(message.EventType, message.Payload, CancellationToken.None));

                    message.MarkAsProcessed(DateTimeOffset.UtcNow);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to enqueue OutboxMessage {MessageId} ({EventType}) to Hangfire.", message.Id, message.EventType);
                    message.RecordFailure(ex.Message);
                }
            }

            await outboxDbContext.SaveChangesAsync(cancellationToken);
            totalProcessed += messages.Count;
        }

        return totalProcessed;
    }
}
