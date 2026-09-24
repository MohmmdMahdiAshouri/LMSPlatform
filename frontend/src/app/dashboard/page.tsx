import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/lib/server/get-query-client';
import {
    currentUserServer,
    sessionsServer,
} from '@/features/authentication/services/auth.server';

import ChangePassword from '@/features/authentication/components/ChangePassword';
import ResendVerifyEmail from '@/features/authentication/components/ResendVerifyEmail';
import SessionsManagement from '@/features/authentication/components/SessionsManagement';

export default async function Page() {
    const queryClient = getQueryClient();

    let user;
    let sessions
    try {
        [user, sessions] = await Promise.all([
            queryClient.query({
                queryKey: ['auth', 'me'],
                queryFn: currentUserServer,
            }),
            queryClient.query({
                queryKey: ['auth', 'sessions'],
                queryFn: sessionsServer,
            }),
        ]);
    } catch {
        return <div>کاربر پیدا نشد</div>;
    }
    
    if (!user) return <div>کاربر پیدا نشد</div>;
    
    console.log(sessions);
    console.log(user);
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="w-full mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        مدیریت حساب کاربری
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        اطلاعات حساب، امنیت و نشست‌های فعال خود را مدیریت کنید.
                    </p>
                </div>

                <div className="flex gap-x-5">
                    <ResendVerifyEmail user={user} />
                    <ChangePassword />
                </div>

                <SessionsManagement />
            </div>
        </HydrationBoundary>
    );
}
