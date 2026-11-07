using LMS.Shared.Domain.Abstractions;
using LMS.Shared.Domain.Events;

namespace LMS.Shared.Domain;


public abstract class Entity : IEntity
{
    private readonly List<IDomainEvent> _events = new();
    public Guid Id { get; protected set; }
    public IReadOnlyList<IDomainEvent> DomainEvents => _events.AsReadOnly();

    protected void Raise(IDomainEvent @event) => _events.Add(@event);
    public void ClearDomainEvents() => _events.Clear();

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other) return false;
        if (ReferenceEquals(this, other)) return true;
        if (GetType() != other.GetType()) return false;
        return Id == other.Id;
    }

    public static bool operator ==(Entity? a, Entity? b) => a?.Equals(b) ?? b is null;
    public static bool operator !=(Entity? a, Entity? b) => !(a == b);

    public override int GetHashCode() => Id.GetHashCode();
}

public abstract class AggregateRoot<TId> : Entity, IAggregateRoot where TId : struct
{
    public new TId Id
    {
        get => (TId)(object)base.Id;
        protected set => base.Id = (Guid)(object)value;
    }
}
