using LMS.Shared.Common.Results;
using MediatR;

namespace LMS.Shared.Application.Cqrs;

/// <summary>
/// Defines a handler for a CQRS command that returns a non-generic Result.
/// </summary>
/// <typeparam name="TCommand">The type of command being handled.</typeparam>
public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand, Result>
    where TCommand : ICommand
{
}

/// <summary>
/// Defines a handler for a CQRS command that returns a Result containing TResponse data.
/// </summary>
/// <typeparam name="TCommand">The type of command being handled.</typeparam>
/// <typeparam name="TResponse">The type of payload returned upon success.</typeparam>
public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse>
{
}
