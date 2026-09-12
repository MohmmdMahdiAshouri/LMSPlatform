'use client';
import z from 'zod';
import { ChangeEvent, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { PASSWORD_REGEX } from '@/features/authentication/constants/authentication.constant';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useResetPassword } from '@/features/authentication/hooks/usesignIn';

const isValidate = z.object({
    newPassword: z
        .string()
        .regex(
            PASSWORD_REGEX,
            'رمز عبور باید بین ۸ تا ۶۴ کاراکتر و شامل حرف بزرگ، حرف کوچک، عدد و کاراکتر خاص باشد',
        ),
});
export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get('password-reset-token') as string;

    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setInput(value);

        if (value.trim() === '') {
            setError('');
            return;
        }

        const { error: orgError, success } = isValidate.safeParse({
            newPassword: value,
        });
        if (!success) {
            const issues = JSON.parse(orgError.message);
            setError(issues[0]?.message ?? 'خطای نامعتبر');
        } else {
            setError('');
        }
    };

    const { mutate } = useResetPassword();

    return (
        <AlertDialog defaultOpen>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <Label className="text-lg " htmlFor="new-password">
                        رمز عبور جدید
                    </Label>
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        dir="ltr"
                        name="new-password"
                    />
                    {error && (
                        <AlertDialogTitle className="text-red-500 text-sm mt-1">
                            {error}
                        </AlertDialogTitle>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-center!">
                    <AlertDialogCancel>لغو</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={
                            isValidate.safeParse({ newPassword: input }).success
                                ? false
                                : true
                        }
                        onClick={() => mutate({ token, password: input })}
                    >
                        تایید
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
