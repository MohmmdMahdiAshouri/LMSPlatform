using LMS.Shared.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LMS.Shared.Infrastructure.Persistence;

public interface IOutboxDbContext
{
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
