using System.Text.RegularExpressions;
using LMS.Shared.Domain;

namespace LMS.Identity.Authentication.Domain.ValueObjects;

public sealed partial class Email : ValueObject
{
    public const int MaxLength = 255;
    public const string RegexPattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";

    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email Create(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            throw new ArgumentException("Email cannot be empty.", nameof(raw));

        var normalized = raw.Trim().ToLowerInvariant();

        if (normalized.Length > MaxLength)
            throw new ArgumentException($"Email must be at most {MaxLength} characters.", nameof(raw));

        if (!EmailRegex().IsMatch(normalized))
            throw new ArgumentException("Email format is invalid.", nameof(raw));

        return new Email(normalized);
    }

    public static bool TryCreate(string? raw, [System.Diagnostics.CodeAnalysis.NotNullWhen(true)] out Email? email)
    {
        email = null;
        if (string.IsNullOrWhiteSpace(raw))
            return false;

        var normalized = raw.Trim().ToLowerInvariant();

        if (normalized.Length > MaxLength || !EmailRegex().IsMatch(normalized))
            return false;

        email = new Email(normalized);
        return true;
    }

    [GeneratedRegex(RegexPattern, RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex EmailRegex();

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
