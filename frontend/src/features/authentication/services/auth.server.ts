import 'server-only';
import { serverFetch } from '@/shared/lib/server/serverFetch';
import { CurrentUser, session } from '../types/auth.type';

export async function currentUserServer() {
    return serverFetch<CurrentUser>('auth/me', { auth: true });
}

export async function sessionsServer() {
    return serverFetch<session[]>('auth/sessions', { auth: true });
}
