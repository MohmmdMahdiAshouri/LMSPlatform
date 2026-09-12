import { apiClient } from '@/shared/lib/apiClient';

export async function verifyEmailService(verificationToken: string) {
    const response = await apiClient.post('auth/verify-email', {verificationToken});
    return response;
}