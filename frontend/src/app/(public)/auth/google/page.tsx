'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/authentication/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';

export default function GooglePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get('error');
        if (queryError) {
            router.replace(`/auth?error=${encodeURIComponent(queryError)}`);
            return;
        }

        const hash = window.location.hash.slice(1);
        const token = new URLSearchParams(hash).get('accessToken');

        if (!token) {
            router.replace('/auth?error=google_oauth_failed');
            return;
        }

        setAccessToken(token);
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

        window.history.replaceState(null, '', window.location.pathname);

        router.replace('/dashboard');
        router.refresh();
    }, [router, setAccessToken, queryClient]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-muted-foreground animate-pulse">در حال ورود به حساب کاربری...</p>
        </div>
    );
}
