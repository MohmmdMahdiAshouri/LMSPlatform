using LMS.Shared.Common.Results;
using MediatR;

namespace LMS.Shared.Application.Cqrs;

/// <summary>
/// Defines a handler for a CQRS query returning a Result containing TResponse data.
/// </summary>
/// <typeparam name="TQuery">The type of query being handled.</typeparam>
/// <typeparam name="TResponse">The type of payload returned upon success.</typeparam>
public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}
