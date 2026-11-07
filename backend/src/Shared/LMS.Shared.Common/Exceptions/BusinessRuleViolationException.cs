using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public class BusinessRuleViolationException : DomainException
{
    public string RuleName { get; }

    public BusinessRuleViolationException(
        string ruleName,
        string message,
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null)
        : base(
            message,
            code ?? ErrorCode.DomainRuleViolation,
            EnrichMetadata(ruleName, metadata))
    {
        RuleName = ruleName;
    }

    private static IReadOnlyDictionary<string, object?> EnrichMetadata(
        string ruleName,
        IReadOnlyDictionary<string, object?>? metadata)
    {
        var dict = metadata is not null 
            ? new Dictionary<string, object?>(metadata) 
            : new Dictionary<string, object?>();

        dict["ruleName"] = ruleName;
        return dict;
    }
}
