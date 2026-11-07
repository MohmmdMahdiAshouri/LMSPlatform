namespace LMS.Shared.Common.Errors;


public readonly record struct ErrorCode(string Value)
{
    public static readonly ErrorCode None = new(string.Empty);

    public static ErrorCode From(string category, string name)
        => new($"{category}.{name}");

    // Framework / System error codes
    public static readonly ErrorCode Internal = From("FRAMEWORK", "INTERNAL_ERROR");
    public static readonly ErrorCode Validation = From("FRAMEWORK", "VALIDATION");
    public static readonly ErrorCode BadRequest = From("FRAMEWORK", "BAD_REQUEST");
    public static readonly ErrorCode ClientClosed = From("FRAMEWORK", "CLIENT_CLOSED");
    public static readonly ErrorCode RoutingNotFound = From("ROUTING", "NOT_FOUND");

    // Auth error codes
    public static readonly ErrorCode Unauthorized = From("AUTH", "UNAUTHORIZED");
    public static readonly ErrorCode Forbidden = From("AUTH", "FORBIDDEN");
    public static readonly ErrorCode InvalidCredentials = From("AUTH", "INVALID_CREDENTIALS");
    public static readonly ErrorCode PasswordLoginNotAvailable = From("AUTH", "PASSWORD_LOGIN_NOT_AVAILABLE");


    // Domain error codes
    public static readonly ErrorCode DomainRuleViolation = From("DOMAIN", "RULE_VIOLATION");
    public static readonly ErrorCode DomainNotFound = From("DOMAIN", "NOT_FOUND");
    public static readonly ErrorCode DomainConflict = From("DOMAIN", "CONFLICT");
    public static readonly ErrorCode ArgumentInvalid = From("DOMAIN", "ARGUMENT_INVALID");
    public static readonly ErrorCode InvalidOperation = From("DOMAIN", "INVALID_OPERATION");

    public static readonly ErrorCode DatabaseError = From("INFRA", "DB_ERROR");
    public static readonly ErrorCode ConcurrencyConflict = From("INFRA", "CONCURRENCY_CONFLICT");
    public static readonly ErrorCode ExternalServiceFailure = From("INFRA", "EXTERNAL_FAILURE");

    public override string ToString() => Value;

    public static implicit operator string(ErrorCode code) => code.Value;
    public static implicit operator ErrorCode(string value) => new(value);
}
