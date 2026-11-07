namespace LMS.Shared.Application.Abstractions;

public interface IEventRegistry
{
    void Register<TEvent>(string eventTypeName) where TEvent : class;

    void Register(string eventTypeName, Type eventType);

    Type? GetType(string eventTypeName);
}
