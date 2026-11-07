using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public class ConflictException : LmsException
{
    public ConflictException(
        string message,
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null)
        : base(code ?? ErrorCode.DomainConflict, message, 409, metadata)
    {
    }

    public static ConflictException Duplicate<TEntity>(string field, object value)
        => new(
            $"{typeof(TEntity).Name} with {field} '{value}' already exists.",
            ErrorCode.DomainConflict,
            new Dictionary<string, object?>
            {
                ["entity"] = typeof(TEntity).Name,
                ["field"] = field,
                ["value"] = value?.ToString()
            });
}
