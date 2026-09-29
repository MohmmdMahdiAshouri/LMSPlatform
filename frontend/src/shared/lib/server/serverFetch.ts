import { cookies } from 'next/headers';
import { API_CONFIG } from '../client/api.config';

type ServerFetchOptions = {
    auth?: boolean; // آیا این GET نیاز به احراز هویت داره؟
};

export async function serverFetch<T>(
    endpoint: string,
    options: ServerFetchOptions = {},
): Promise<T | null> {
    const headers: Record<string, string> = {};

    if (options.auth) {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (!refreshToken) return null;

        const refreshRes = await fetch(
            `${API_CONFIG.SERVER_BASE_URL}/auth/refresh-token`,
            {
                method: 'POST',
                headers: { cookie: `refreshToken=${refreshToken}` },
            },
        );

        if (!refreshRes.ok) return null;

        const { data } = await refreshRes.json();
        headers.Authorization = `Bearer ${data.accessToken}`;
    }

    const res = await fetch(`${API_CONFIG.SERVER_BASE_URL}/${endpoint}`, {
        headers,
    });
    
    if (!res.ok) return null;
    
    const { data } = await res.json();
    return data as T;
}
