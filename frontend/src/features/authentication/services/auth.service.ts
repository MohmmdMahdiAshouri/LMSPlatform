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

    export async function currentUserClient() {
        const user = await apiClient.get<CurrentUser>('auth/me');
        return user;
    }

    export async function resendVerifyEmail() {
        const response = await apiClient.post('auth/resend-verification-token');
        return response;
    }

    export async function changePassword(payload: ChangePasswordValues) {
        const response = await apiClient.patch('auth/change-password', payload);
        return response;
    }

    export async function sessionsClient() {
        const response = await apiClient.get<session[]>('auth/sessions');
        return response;
    }

    export async function logoutCurrent() {
        const response = await apiClient.delete('auth/logout');
        return response;
    }

    export async function logoutAll() {
        const response = await apiClient.delete('auth/sessions');
        return response;
    }

    export async function logoutSpecific(sessionId: string) {
        const response = await apiClient.delete(`auth/sessions/${sessionId}`);
        return response;
    }
