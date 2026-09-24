import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SignUpFormValues } from '../schemas/signUp.schema';
import { getErrorMessage } from '@/shared/lib/client/client-utils';
import {
    changePassword,
    currentUserClient,
    forgotPasswordService,
    logoutAll,
    logoutCurrent,
    logoutSpecific,
    resendVerifyEmail,
    resetPassword,
    sessionsClient,
    signInService,
    signUpService,
} from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';

const setAccessToken = useAuthStore.getState().setAccessToken;
const clear = useAuthStore.getState().clear

export function useSignUp() {
    return useMutation({
        mutationFn: (values: SignUpFormValues) => {
            const { confirmPassword, ...payload } = values;
            return signUpService(payload);
        },
        onSuccess: (res) => {
            if (!res.data) return;
            setAccessToken(res.data.accessToken);
            
            alert('succes');
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}
export function useSignIn() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: signInService,
        onSuccess: (res) => {
            if (!res.data) return;
            setAccessToken(res.data.accessToken);
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: forgotPasswordService,
        onSuccess: (res) => {
            alert(res.message);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (res) => {
            alert(res.message);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useCurrentUser() {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: currentUserClient,
    });
}

export function useResendVerifyEmail() {
    return useMutation({
        mutationFn: resendVerifyEmail,
        onSuccess: (res) => {
            alert(res.message);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: (res) => {
            alert(res.message);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useSessions() {
    return useQuery({
        queryKey: ['auth', 'sessions'],
        queryFn: sessionsClient,
    });
}

export function useLogoutCurrent() {
    const queryClient = useQueryClient();
    const router = useRouter()
    return useMutation({
        mutationFn: logoutCurrent,
        onSuccess: (res) => {
            clear();
            queryClient.setQueryData(['auth', 'me'], null);

            router.replace('/')
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useLogoutAll() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutAll,
        onSuccess: (res) => {
            clear();
            queryClient.setQueryData(['auth', 'me'], {
                data: null,
            });
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}

export function useLogoutSpecific() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => logoutSpecific(sessionId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({queryKey: ['auth', 'sessions']})
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}