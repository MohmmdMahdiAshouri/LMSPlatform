namespace LMS.Shared.Domain;

/// <summary>
/// Base class for Value Objects — immutable, equality by value, self-validating at construction.
/// Mirrors the NestJS <c>ValueObject</c> pattern from the original implementation.
/// </summary>
public abstract class ValueObject
{
    protected static void Require(bool predicate, string message)
    {
        if (!predicate) throw new ArgumentException(message);
    }

    protected abstract IEnumerable<object?> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType()) return false;
        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
        => GetEqualityComponents()
            .Aggregate(0, (hash, obj) => hash ^ (obj?.GetHashCode() ?? 0));

    public static bool operator ==(ValueObject? a, ValueObject? b) => a?.Equals(b) ?? b is null;
    public static bool operator !=(ValueObject? a, ValueObject? b) => !(a == b);
}
