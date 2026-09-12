import { apiClient } from '@/shared/lib/apiClient';
import { signInFormValues } from '../schemas/signIn.schema';
import { ResetPassword, signInResponseType } from '../types/auth.type';
import { signUpPayloadType, signUpResponseType } from '../types/auth.type';

export async function signUpService(payload: signUpPayloadType) {
    const response = await apiClient.post<signUpResponseType>(
        'auth/register',
        payload,
    );
    return response;
}
export async function signInService(payload: signInFormValues) {
    const response = await apiClient.post<signInResponseType>(
        'auth/login',
        payload,
    );
    return response;
}

export async function forgotPasswordService(email: string) {
    const response = await apiClient.post('auth/forgot-password', { email });
    return response;
}

export async function resetPassword(payload: ResetPassword) {
    const response = await apiClient.post('auth/reset-password', payload);
    return response;
}
