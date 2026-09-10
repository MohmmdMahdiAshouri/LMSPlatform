import { useMutation } from '@tanstack/react-query';
import { forgotPasswordService, signinService } from '../services/signin.service';
import { getErrorMessage } from '@/shared/lib/utils';

export function useSignin() {
    return useMutation({
        mutationFn: signinService,
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
