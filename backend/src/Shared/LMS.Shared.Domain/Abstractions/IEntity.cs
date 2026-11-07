namespace LMS.Shared.Domain.Abstractions;

public interface IEntity
{
    Guid Id { get; }
}

public interface IAggregateRoot : IEntity { }
