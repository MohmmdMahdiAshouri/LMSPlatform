using System.Collections.Generic;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.Common.Exceptions;

public class NotFoundException : LmsException
{
    public string? ResourceName { get; }
    public object? ResourceIdentifier { get; }

    public NotFoundException(
        string message,
        ErrorCode? code = null,
        IReadOnlyDictionary<string, object?>? metadata = null)
        : base(code ?? ErrorCode.DomainNotFound, message, 404, metadata)
    {
    }

    public NotFoundException(string resourceName, object resourceIdentifier)
        : base(
            ErrorCode.DomainNotFound,
            $"{resourceName} with identifier '{resourceIdentifier}' was not found.",
            404,
            new Dictionary<string, object?>
            {
                ["resource"] = resourceName,
                ["identifier"] = resourceIdentifier?.ToString()
            })
    {
        ResourceName = resourceName;
        ResourceIdentifier = resourceIdentifier;
    }

    public static NotFoundException For<TEntity>(object identifier)
    {
        return new NotFoundException(typeof(TEntity).Name, identifier);
    }
}
