using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;


public class UnauthorizedException : LmsException
{
    public UnauthorizedException(
        string message = "You are not authorized to perform this action.",
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null)
        : base(code ?? ErrorCode.Unauthorized, message, 401, metadata)
    {
    }
}
