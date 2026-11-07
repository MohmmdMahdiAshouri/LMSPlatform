namespace LMS.Shared.Common.Errors;

public sealed record Error
{
    public ErrorCode Code { get; }
    public string Message { get; }
    public int HttpStatusCode { get; }
    public IReadOnlyDictionary<string, object?> Metadata { get; }

    private Error(ErrorCode code, string message, int httpStatusCode, IReadOnlyDictionary<string, object?>? metadata = null)
    {
        Code = code;
        Message = message;
        HttpStatusCode = httpStatusCode;
        Metadata = metadata ?? new Dictionary<string, object?>();
    }

    public static Error None => new(ErrorCode.None, string.Empty, 0);

    public static Error New(
        ErrorCode code,
        string message,
        int httpStatusCode,
        IReadOnlyDictionary<string, object?>? metadata = null)
        => new(code, message, httpStatusCode, metadata);

    public static Error NotFound(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 404, metadata);

    public static Error NotFound(string entityName, object id)
        => NotFound(
            ErrorCode.DomainNotFound,
            $"{entityName} with id '{id}' was not found.",
            new Dictionary<string, object?> { ["entity"] = entityName, ["id"] = id?.ToString() });

    public static Error Unauthorized(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 401, metadata);

    public static Error Unauthorized(string message = "Unauthorized access.")
        => Unauthorized(ErrorCode.Unauthorized, message);

    public static Error Forbidden(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 403, metadata);

    public static Error Forbidden(string message = "Access forbidden.")
        => Forbidden(ErrorCode.Forbidden, message);

    public static Error Conflict(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 409, metadata);

    public static Error Conflict(string message)
        => Conflict(ErrorCode.DomainConflict, message);

    public static Error Validation(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 400, metadata);

    public static Error Validation(string message, IReadOnlyDictionary<string, string[]> validationErrors)
        => New(
            ErrorCode.Validation,
            message,
            400,
            new Dictionary<string, object?> { ["validationErrors"] = validationErrors });

    public static Error Validation(string propertyName, string errorMessage)
        => Validation("One or more validation errors occurred.", new Dictionary<string, string[]>
        {
            [propertyName] = [errorMessage]
        });

    public static Error BusinessRule(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 422, metadata);

    public static Error BusinessRule(string message, string? ruleName = null)
    {
        var meta = ruleName is not null
            ? new Dictionary<string, object?> { ["ruleName"] = ruleName }
            : null;
        return BusinessRule(ErrorCode.DomainRuleViolation, message, meta);
    }

    public static Error BadRequest(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 400, metadata);

    public static Error BadRequest(string message)
        => BadRequest(ErrorCode.BadRequest, message);

    public static Error Internal(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 500, metadata);

    public static Error Internal(string message = "An internal server error occurred.")
        => Internal(ErrorCode.Internal, message);

    public static Error Infrastructure(ErrorCode code, string message, IReadOnlyDictionary<string, object?>? metadata = null)
        => New(code, message, 503, metadata);

    public Error WithMetadata(string key, object? value)
    {
        var dict = new Dictionary<string, object?>(Metadata)
        {
            [key] = value
        };
        return new Error(Code, Message, HttpStatusCode, dict);
    }

    public Error WithMetadata(IReadOnlyDictionary<string, object?> metadata)
    {
        var dict = new Dictionary<string, object?>(Metadata);
        foreach (var (key, value) in metadata)
        {
            dict[key] = value;
        }
        return new Error(Code, Message, HttpStatusCode, dict);
    }

    public override string ToString() => $"[{Code}] {Message}";
}
