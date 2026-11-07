using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public class ValidationException : LmsException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(
        IReadOnlyDictionary<string, string[]> errors,
        string message = "One or more validation failures have occurred.")
        : base(
            ErrorCode.Validation,
            message,
            400,
            new Dictionary<string, object?> { ["validationErrors"] = errors })
    {
        Errors = errors;
    }

    public ValidationException(string propertyName, string errorMessage)
        : this(new Dictionary<string, string[]>
        {
            [propertyName] = [errorMessage]
        })
    {
    }
}
