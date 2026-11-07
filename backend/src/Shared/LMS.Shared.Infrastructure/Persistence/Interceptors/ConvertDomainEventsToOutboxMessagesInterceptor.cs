using System.Runtime.CompilerServices;
using LMS.Shared.Common.Primitives;
using LMS.Shared.Domain;
using LMS.Shared.Domain.Entities;
using LMS.Shared.Infrastructure.BackgroundJobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace LMS.Shared.Infrastructure.Persistence.Interceptors;

public sealed class ConvertDomainEventsToOutboxMessagesInterceptor(IOutboxSignal outboxSignal) : SaveChangesInterceptor
{
    private readonly ConditionalWeakTable<DbContext, StrongBox<bool>> _pendingOutboxSignals = new();

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ProcessDomainEvents(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ProcessDomainEvents(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        NotifyIfOutboxMessagesCommitted(eventData.Context);
        return base.SavedChanges(eventData, result);
    }

    public override ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        NotifyIfOutboxMessagesCommitted(eventData.Context);
        return base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override void SaveChangesFailed(DbContextErrorEventData eventData)
    {
        CleanupContextState(eventData.Context);
        base.SaveChangesFailed(eventData);
    }

    public override Task SaveChangesFailedAsync(
        DbContextErrorEventData eventData,
        CancellationToken cancellationToken = default)
    {
        CleanupContextState(eventData.Context);
        return base.SaveChangesFailedAsync(eventData, cancellationToken);
    }

    private void ProcessDomainEvents(DbContext? dbContext)
    {
        if (dbContext is null)
        {
            return;
        }

        var entitiesWithEvents = dbContext.ChangeTracker
            .Entries<Entity>()
            .Where(entry => entry.Entity.DomainEvents.Count > 0)
            .Select(entry => entry.Entity)
            .ToList();

        if (entitiesWithEvents.Count == 0)
        {
            return;
        }

        var outboxMessages = new List<OutboxMessage>();

        foreach (var entity in entitiesWithEvents)
        {
            foreach (var domainEvent in entity.DomainEvents)
            {
                var payload = SystemTextJson.Serialize((object)domainEvent);
                var message = OutboxMessage.Create(
                    domainEvent.EventType,
                    payload,
                    domainEvent.OccurredAt);

                outboxMessages.Add(message);
            }

            entity.ClearDomainEvents();
        }

        if (outboxMessages.Count > 0)
        {
            dbContext.Set<OutboxMessage>().AddRange(outboxMessages);
            _pendingOutboxSignals.GetOrCreateValue(dbContext).Value = true;
        }
    }

    private void NotifyIfOutboxMessagesCommitted(DbContext? dbContext)
    {
        if (dbContext is null)
        {
            return;
        }

        if (_pendingOutboxSignals.TryGetValue(dbContext, out var hasPending) && hasPending.Value)
        {
            _pendingOutboxSignals.Remove(dbContext);
            outboxSignal.Notify();
        }
    }

    private void CleanupContextState(DbContext? dbContext)
    {
        if (dbContext is not null)
        {
            _pendingOutboxSignals.Remove(dbContext);
        }
    }
}
