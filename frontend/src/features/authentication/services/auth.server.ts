import 'server-only';
import { serverFetch } from '@/shared/lib/server/serverFetch';
import { CurrentUser, session } from '../types/auth.type';

export async function currentUserServer() {
    return serverFetch<CurrentUser>('authentication/me', { auth: true });
}

export async function sessionsServer() {
    return serverFetch<session[]>('session/sessions', { auth: true });
}
