using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public class ForbiddenException : LmsException
{
    public ForbiddenException(
        string message = "You do not have permission to access this resource.",
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null)
        : base(code ?? ErrorCode.Forbidden, message, 403, metadata)
    {
    }
}
