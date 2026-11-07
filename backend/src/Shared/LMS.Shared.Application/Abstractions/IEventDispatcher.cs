namespace LMS.Shared.Application.Abstractions;

public interface IEventDispatcher
{
    Task DispatchAsync(string eventType, string payload, CancellationToken cancellationToken = default);
}
