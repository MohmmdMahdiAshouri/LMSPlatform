import { useSearchParams } from 'next/navigation';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import { useEffect } from 'react';
import { getErrorMessage } from '@/shared/lib/utils';

export default function VerifyEmail() {
    const searchParam = useSearchParams();
    const verificationToken = searchParam.get('verification-token') as string;

    const { mutate, isPending, isSuccess, isError, error } = useVerifyEmail();

    useEffect(() => {
        mutate(verificationToken);
    }, []);

    return (
        <div className="text-black h-screen w-screen flex items-center justify-center">
            {isPending ? (
                <div>درحال تایید ایمیل شما</div>
            ) : isSuccess ? (
                <div>ایمیل شما تایید شد</div>
            ) : isError ? (
                <div>{getErrorMessage(error)}</div>
            ) : null}
        </div>
    );
}
