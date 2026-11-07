namespace LMS.Shared.Domain.Abstractions;

/// <summary>
/// Unit of Work port — commits the persistence context for the current request.
/// Implemented by EF Core DbContext in LMS.Shared.Infrastructure.
/// </para>
/// <para>Repositories never call SaveChanges themselves; the application layer calls
/// <c>IUnitOfWork.SaveChangesAsync(cancellationToken)</c> at the end of each command.</p>
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
