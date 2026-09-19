import { useMutation, useQuery } from '@tanstack/react-query';
import { SignUpFormValues } from '../schemas/signUp.schema';
import { getErrorMessage } from '@/shared/lib/client/client-utils';
import {
    currentUser,
    forgotPasswordService,
    resetPassword,
    signInService,
    signUpService,
} from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/shared/lib/client/tanstackClient';

const setAccessToken = useAuthStore.getState().setAccessToken;

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
    const router = useRouter();
    // const queryClient = queryClient()
    return useMutation({
        mutationFn: signInService,
        onSuccess: (res) => {
            if (!res.data) return;
            setAccessToken(res.data.accessToken);
            // router.replace('/')
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
        queryKey: ['auth', 'me'] as const,
        queryFn: currentUser,
        retry: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60,
    });
}
