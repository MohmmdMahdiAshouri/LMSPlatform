import { useMutation } from '@tanstack/react-query';
import { signupService } from '../services/signup.service';
import { SignupFormValues } from '../schemas/signup.schema';
import { getErrorMessage } from '@/shared/lib/utils';

export function useSignup() {
    return useMutation({
        mutationFn: (values: SignupFormValues) => {
            const { confirmPassword, ...payload } = values;
            return signupService(payload);
        },
        onSuccess: (res) => {
            alert(res.data?.accessToken);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}
