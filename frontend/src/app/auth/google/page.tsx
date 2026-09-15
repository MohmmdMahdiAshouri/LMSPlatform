'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/authentication/stores/auth.store';

export default function GooglePage() {
    const router = useRouter();

    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;

        processed.current = true;

        const hash = window.location.hash.slice(1);

        const token = new URLSearchParams(hash).get('accessToken');

        if (!token) {
            router.replace('/login');
            return;
        }

        setAccessToken(token);

        window.history.replaceState(null, '', window.location.pathname);

        router.replace('/');
    }, [router, setAccessToken]);

    return <p>...در حال ورود</p>;
}
