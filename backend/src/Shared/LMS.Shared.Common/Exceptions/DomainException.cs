using System;
using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;


public class DomainException : LmsException
{
    public DomainException(
        string message,
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null,
        Exception? innerException = null)
        : base(
            code ?? ErrorCode.DomainRuleViolation,
            message,
            422,
            metadata,
            innerException)
    {
    }

    public DomainException(
        ErrorCode code,
        string message,
        IReadOnlyDictionary<string, object?>? metadata = null,
        Exception? innerException = null)
        : base(code, message, 422, metadata, innerException)
    {
    }
}
