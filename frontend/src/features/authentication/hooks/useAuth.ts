import { useMutation } from '@tanstack/react-query';
import { signUpService } from '../services/auth.service';
import { SignUpFormValues } from '../schemas/signUp.schema';
import { getErrorMessage } from '@/shared/lib/utils';
import {
    forgotPasswordService,
    resetPassword,
    signInService,
} from '../services/auth.service';

export function useSignUp() {
    return useMutation({
        mutationFn: (values: SignUpFormValues) => {
            const { confirmPassword, ...payload } = values;
            return signUpService(payload);
        },
        onSuccess: (res) => {
            alert(res.data?.accessToken);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}
export function useSignIn() {
    return useMutation({
        mutationFn: signInService,
        onSuccess: (res) => {
            alert(res?.data?.accessToken);
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