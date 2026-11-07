using LMS.Shared.Common.Results;
using MediatR;

namespace LMS.Shared.Application.Cqrs;

/// <summary>
/// Represents a CQRS query that retrieves data without side-effects, returning a Result containing TResponse data.
/// </summary>
/// <typeparam name="TResponse">The type of the query result.</typeparam>
public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
