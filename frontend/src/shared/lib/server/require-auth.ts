import { currentUserServer } from '@/features/authentication/services/auth.server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
    const user = await currentUserServer()
    if(!user) redirect('auth')
    return user
}