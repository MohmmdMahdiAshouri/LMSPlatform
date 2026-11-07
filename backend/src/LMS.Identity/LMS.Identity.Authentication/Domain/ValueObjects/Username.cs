using System.Text.RegularExpressions;
using LMS.Shared.Domain;

namespace LMS.Identity.Authentication.Domain.ValueObjects;

public sealed partial class Username : ValueObject
{
    public const int MinLength = 3;
    public const int MaxLength = 30;
    public const string RegexPattern = @"^[A-Za-z][A-Za-z0-9_]*(?<!_)$";

    public string Value { get; }

    private Username(string value) => Value = value;

    public static Username Create(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            throw new ArgumentException("Username cannot be empty.", nameof(raw));

        var value = raw.Trim();
        if (value.Length < MinLength || value.Length > MaxLength)
            throw new ArgumentException($"Username must be between {MinLength} and {MaxLength} characters.", nameof(raw));

        if (value.Contains("__"))
            throw new ArgumentException("Username cannot contain consecutive underscores.", nameof(raw));

        if (!UsernameRegex().IsMatch(value))
            throw new ArgumentException(
                "Username must start with a letter, may contain letters/digits/underscore, and must not end with an underscore.",
                nameof(raw));

        return new Username(value);
    }

    public static bool TryCreate(string? raw, [System.Diagnostics.CodeAnalysis.NotNullWhen(true)] out Username? username)
    {
        username = null;
        if (string.IsNullOrWhiteSpace(raw))
            return false;

        var value = raw.Trim();
        if (value.Length < MinLength || value.Length > MaxLength)
            return false;

        if (value.Contains("__"))
            return false;

        if (!UsernameRegex().IsMatch(value))
            return false;

        username = new Username(value);
        return true;
    }

    [GeneratedRegex(RegexPattern, RegexOptions.Compiled)]
    private static partial Regex UsernameRegex();

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
