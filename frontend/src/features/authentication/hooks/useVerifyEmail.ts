import { useMutation } from '@tanstack/react-query';
import { verifyEmailService } from '../services/verifyEmail.service';
import { getErrorMessage } from '@/shared/lib/utils';

export function useVerifyEmail () {
    return useMutation({
        mutationFn: verifyEmailService,
        // onSuccess: (data) => {
        //     alert(data.message)
        // },
        // onError: (error) => {
        //     alert(getErrorMessage(error))
        // }
    })
}