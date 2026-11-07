using System.Threading.Channels;

namespace LMS.Shared.Infrastructure.BackgroundJobs;

public sealed class OutboxSignal : IOutboxSignal
{
    private readonly Channel<bool> _channel = Channel.CreateBounded<bool>(new BoundedChannelOptions(1)
    {
        FullMode = BoundedChannelFullMode.DropOldest,
        SingleReader = true,
        SingleWriter = false
    });

    public void Notify()
    {
        _channel.Writer.TryWrite(true);
    }

    public async Task WaitAsync(TimeSpan timeout, CancellationToken cancellationToken)
    {
        if (timeout <= TimeSpan.Zero)
        {
            return;
        }

        using var timeoutCts = new CancellationTokenSource(timeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

        try
        {
            if (await _channel.Reader.WaitToReadAsync(linkedCts.Token).ConfigureAwait(false))
            {
                while (_channel.Reader.TryRead(out _))
                {
                }
            }
        }
        catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            // Fallback timeout expired; safely continue to allow periodic self-healing sweep
        }
    }
}
