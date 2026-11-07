import { apiClient } from '@/shared/lib/client/apiClient';
import { SignInFormValues } from '../schemas/signIn.schema';
import {
    CurrentUser,
    ResetPassword,
    session,
    SignInResponseType,
} from '../types/auth.type';
import { SignUpPayloadType, SignUpResponseType } from '../types/auth.type';
import { ChangePasswordValues } from '../schemas/change-password.schema';

export async function signUpService(payload: SignUpPayloadType) {
    const response = await apiClient.post<SignUpResponseType>(
        'authentication/register',
        payload,
    );
    return response;
}

export async function signInService(payload: SignInFormValues) {
    const response = await apiClient.post<SignInResponseType>(
        'authentication/login',
        payload,
    );
    return response;
}

export async function forgotPasswordService(email: string) {
    const response = await apiClient.post('password/forgot-password', { email });
    return response;
}

export async function resetPassword(payload: ResetPassword) {
    const response = await apiClient.post('password/reset-password', payload);
    return response;
}

export async function currentUserClient() {
    const response = await apiClient.get<CurrentUser>('authentication/me');
    return response.data;
}

export async function resendVerifyEmail() {
    const response = await apiClient.post('verification/resend-verification-token');
    return response;
}

export async function changePassword(payload: ChangePasswordValues) {
    const response = await apiClient.patch('password/change-password', payload);
    return response;
}

export async function sessionsClient() {
    const response = await apiClient.get<session[]>('session/sessions');
    return response.data;
}

export async function logoutCurrent() {
    const response = await apiClient.delete('session/logout');
    return response;
}

export async function logoutAll() {
    const response = await apiClient.delete('session/logout-all');
    return response;
}

export async function logoutSpecific(sessionId: string) {
    const response = await apiClient.delete(`session/${sessionId}`);
    return response;
}
