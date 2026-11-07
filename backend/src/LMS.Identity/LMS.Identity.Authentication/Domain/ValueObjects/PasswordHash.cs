using LMS.Shared.Domain;

namespace LMS.Identity.Authentication.Domain.ValueObjects;

public sealed class PasswordHash : ValueObject
{
    public string Value { get; }

    private PasswordHash(string value) => Value = value;

    public static PasswordHash Create(string hash)
    {
        if (string.IsNullOrWhiteSpace(hash))
            throw new ArgumentException("Password hash cannot be empty.", nameof(hash));

        return new PasswordHash(hash);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
