using System.Text.RegularExpressions;
using LMS.Shared.Domain;

namespace LMS.Identity.Authentication.Domain.ValueObjects;

public sealed partial class Password : ValueObject
{
    public const int MinLength = 8;
    public const int MaxLength = 64;
    public const string RegexPattern = @"(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+";

    public string Value { get; }

    private Password(string value) => Value = value;

    public static Password Create(string raw)
    {
        if (string.IsNullOrEmpty(raw))
            throw new ArgumentException("Password cannot be empty.", nameof(raw));

        if (raw.Length < MinLength || raw.Length > MaxLength)
            throw new ArgumentException($"Password must be between {MinLength} and {MaxLength} characters.", nameof(raw));

        if (!PolicyRegex().IsMatch(raw))
            throw new ArgumentException(
                "Password must include uppercase, lowercase, digit, and a special character.",
                nameof(raw));

        return new Password(raw);
    }

    [GeneratedRegex(RegexPattern, RegexOptions.Compiled)]
    private static partial Regex PolicyRegex();

    // Constant-time / reference equality for timing attack protection
    public override bool Equals(object? obj) => ReferenceEquals(this, obj);
    public override int GetHashCode() => System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(this);

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => "[PROTECTED]";
}
