import { requireAuth } from '@/shared/lib/server/require-auth';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAuth()
    return <>{children}</>;
}
