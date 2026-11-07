using LMS.Shared.Common.Results;
using MediatR;

namespace LMS.Shared.Application.Cqrs;

/// <summary>
/// Represents a CQRS command that mutates state and returns a non-generic Result.
/// </summary>
public interface ICommand : IRequest<Result>
{
}

/// <summary>
/// Represents a CQRS command that mutates state and returns a Result containing TResponse data.
/// </summary>
/// <typeparam name="TResponse">The type of the payload produced upon successful execution.</typeparam>
public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}
