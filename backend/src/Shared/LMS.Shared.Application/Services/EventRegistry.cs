using System.Collections.Concurrent;
using LMS.Shared.Application.Abstractions;

namespace LMS.Shared.Application.Services;

public sealed class EventRegistry : IEventRegistry
{
    private readonly ConcurrentDictionary<string, Type> _types = new(StringComparer.OrdinalIgnoreCase);

    public void Register<TEvent>(string eventTypeName) where TEvent : class
    {
        _types[eventTypeName] = typeof(TEvent);
    }

    public void Register(string eventTypeName, Type eventType)
    {
        _types[eventTypeName] = eventType;
    }

    public Type? GetType(string eventTypeName)
    {
        return _types.TryGetValue(eventTypeName, out var type) ? type : null;
    }
}
