namespace LMS.Shared.Infrastructure.BackgroundJobs;

public interface IOutboxSignal
{
    void Notify();
    Task WaitAsync(TimeSpan timeout, CancellationToken cancellationToken);
}
