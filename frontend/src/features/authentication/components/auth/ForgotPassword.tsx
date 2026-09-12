import z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ChangeEvent, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { useForgotPassword } from '../../hooks/useAuth';

const isValidate = z.object({
    email: z.email('ایمیل معتبر نیست').trim().toLowerCase(),
});

export function ForgotPassword() {
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setInput(value);

        if (value.trim() === '') {
            setError('');
            return;
        }

        const { error, success } = isValidate.safeParse({ email: value });

        if (!success) {
            const issues = JSON.parse(error.message);
            setError(issues[0]?.message ?? 'خطای نامعتبر');
        } else {
            setError('');
        }
    };

    const { mutate } = useForgotPassword();

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button
                        variant="link"
                        className="underline underline-offset-5 cursor-pointer text-primary"
                    >
                        فراموشی رمز عبور
                    </Button>
                }
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ایمیل خود را وارد کنید و سپس از طریق لینک ارسال شده رمز
                        خود را تغییر دهید
                    </AlertDialogTitle>
                    <Label className="text-lg" htmlFor="email">
                        ایمیل
                    </Label>
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        dir="ltr"
                        name="email"
                        required
                        className={
                            error ? 'border-red-500' : 'border-secondary'
                        }
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
                        onClick={() => {
                            console.log(input);
                            return mutate(input);
                        }}
                    >
                        تایید
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
