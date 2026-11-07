using System;
using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public abstract class LmsException : Exception
{
    public ErrorCode Code { get; }
    public int HttpStatusCode { get; }
    public IReadOnlyDictionary<string, object?> Metadata { get; }

    protected LmsException(
        ErrorCode code,
        string message,
        int httpStatusCode,
        IReadOnlyDictionary<string, object?>? metadata = null,
        Exception? innerException = null)
        : base(message, innerException)
    {
        Code = code;
        HttpStatusCode = httpStatusCode;
        Metadata = metadata ?? new Dictionary<string, object?>();
    }

    public virtual Error ToError() => Error.New(Code, Message, HttpStatusCode, Metadata);
}
