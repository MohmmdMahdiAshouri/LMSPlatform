
namespace LMS.Shared.Domain.Abstractions;

public interface IRepository<TAggregate, in TId>
    where TAggregate : class, IAggregateRoot
    where TId : struct
{
    Task<TAggregate?> FindByIdAsync(TId id, CancellationToken cancellationToken = default);
    Task AddAsync(TAggregate aggregate, CancellationToken cancellationToken = default);
}
