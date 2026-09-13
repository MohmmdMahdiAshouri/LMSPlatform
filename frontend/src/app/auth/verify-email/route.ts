import { redirect } from 'next/navigation';

export async function GET(req: Request) {
    const token = new URL(req.url).searchParams.get('verification-token');
    if (!token) redirect('/auth/verify-email/failed?reason=missing');

    let ok = false;
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationToken: token }),
                cache: 'no-store',
            },
        );
        ok = res.ok;
    } catch (error) {
        console.error('verify-email fetch failed:', error);
        redirect('/auth/verify-email/failed?reason=network');
    }

    redirect(ok ? '/auth/verify-email/success' : '/auth/verify-email/failed');
}
