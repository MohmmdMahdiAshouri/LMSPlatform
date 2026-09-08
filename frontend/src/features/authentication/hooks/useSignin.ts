import { useMutation } from '@tanstack/react-query';
import { signinService } from '../services/signin.service';
import { getErrorMessage } from '@/shared/lib/utils';

export function useSignin() {
    return useMutation({
        mutationFn: signinService,
        onSuccess: (data) => {
            alert(data.accessToken);
        },
        onError: (error) => {
            alert(getErrorMessage(error));
        },
    });
}
