import { apiClient } from '@/shared/lib/client/apiClient';
import { SignInFormValues } from '../schemas/signIn.schema';
import {
    CurrentUser,
    ResetPassword,
    SignInResponseType,
} from '../types/auth.type';
import { SignUpPayloadType, SignUpResponseType } from '../types/auth.type';

export async function signUpService(payload: SignUpPayloadType) {
    const response = await apiClient.post<SignUpResponseType>(
        'auth/register',
        payload,
    );
    return response;
}
export async function signInService(payload: SignInFormValues) {
    const response = await apiClient.post<SignInResponseType>(
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

export async function currentUser() {
    const response = await apiClient.get<CurrentUser>('auth/me')
    return response
}


