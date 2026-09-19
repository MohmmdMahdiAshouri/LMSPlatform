import { useAppForm } from '@/shared/features/form/hooks/use-app-form';
import {
    signInFormDefaultValues,
    signInFormSchema,
    SignInFormValues,
} from '../schemas/signIn.schema';
import { ForgotPassword } from './ForgotPassword';
import { cn } from '@/shared/lib/client/client-utils';

interface SignInFormProps {
    onSubmit: (value: SignInFormValues) => Promise<void> | void;
    isLoading: boolean;
}

export function SignInForm({ onSubmit, isLoading }: SignInFormProps) {
    const { handleSubmit, AppField, AppForm, SubmitButton } = useAppForm({
        defaultValues: signInFormDefaultValues,
        validators: {
            onChange: signInFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
            }}
        >
            <div className="mt-6 space-y-4">
                <AppField name="emailOrUsername">
                    {(field) => (
                        <field.TextField
                            label="ایمیل یا نام کاربری"
                            placeholder="email@example.com / username_123"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <AppField name="password">
                    {(field) => (
                        <field.TextField
                            type="password"
                            label="رمز عبور"
                            placeholder="Password123!"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <ForgotPassword />

                <AppForm>
                    <SubmitButton
                        isLoading={isLoading}
                        className="w-full rounded-md bg-primary py-3 text-sm text-primary-foreground cursor-pointer"
                    >
                        ورود به حساب
                    </SubmitButton>
                </AppForm>
            </div>
        </form>
    );
}
