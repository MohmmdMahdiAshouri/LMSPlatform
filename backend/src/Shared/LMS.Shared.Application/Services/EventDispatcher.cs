using System.Text.Json;
using LMS.Shared.Application.Abstractions;
using LMS.Shared.Common.Primitives;
using MediatR;
using Microsoft.Extensions.Logging;

namespace LMS.Shared.Application.Services;

public sealed class EventDispatcher(
    IEventRegistry eventRegistry,
    IPublisher publisher,
    ILogger<EventDispatcher> logger) : IEventDispatcher
{
    public async Task DispatchAsync(string eventType, string payload, CancellationToken cancellationToken = default)
    {
        var targetType = eventRegistry.GetType(eventType);
        if (targetType is null)
        {
            logger.LogWarning("No event type registered in EventRegistry for event name: {EventType}. Skipping dispatch.", eventType);
            return;
        }

        var deserializedEvent = JsonSerializer.Deserialize(payload, targetType, SystemTextJson.DefaultOptions);
        if (deserializedEvent is null)
        {
            logger.LogError("Failed to deserialize payload for event type {EventType}. Payload: {Payload}", eventType, payload);
            throw new InvalidOperationException($"Failed to deserialize event payload for '{eventType}'.");
        }

        logger.LogInformation("Dispatching outbox event {EventType} to MediatR notification pipeline.", eventType);
        await publisher.Publish(deserializedEvent, cancellationToken);
    }
}
