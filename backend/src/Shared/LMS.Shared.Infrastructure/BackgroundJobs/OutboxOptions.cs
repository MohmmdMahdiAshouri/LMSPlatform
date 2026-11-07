namespace LMS.Shared.Infrastructure.BackgroundJobs;

public sealed class OutboxOptions
{
    public const string SectionName = "Outbox";

    public TimeSpan FallbackInterval { get; set; } = TimeSpan.FromMinutes(5);

    public TimeSpan? PollInterval
    {
        get => FallbackInterval;
        set
        {
            if (value.HasValue)
            {
                FallbackInterval = value.Value;
            }
        }
    }

    public int BatchSize { get; set; } = 20;
    public int MaxAttempts { get; set; } = 5;
}
