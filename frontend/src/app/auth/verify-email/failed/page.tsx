export default async function FailedPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;

    const messages: Record<string, string> = {
        missing: 'توکن تأیید در لینک وجود ندارد.',
        network: 'خطا در ارتباط با سرور.',
    };

    return (
        <div>
            <h1>تأیید ایمیل ناموفق بود ❌</h1>
            <p>{messages[reason ?? ''] ?? 'توکن نامعتبر است یا این ایمیل قبلا تایید شده است.'}</p>
        </div>
    );
}
