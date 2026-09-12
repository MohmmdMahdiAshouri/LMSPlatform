import { useAppForm } from '@/shared/features/form/hooks/use-app-form';
import {
    signUpFormDefaultValues,
    signUpFormSchema,
    SignUpFormValues,
} from '../../schemas/signUp.schema';

interface SignUpFormProps {
    onSubmit: (value: SignUpFormValues) => Promise<void> | void;
    isLoading: boolean;
}
export default function SignUpForm({ onSubmit, isLoading }: SignUpFormProps) {
    const { handleSubmit, AppField, AppForm, SubmitButton } = useAppForm({
        defaultValues: signUpFormDefaultValues,
        validators: {
            onChange: signUpFormSchema,
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
                <AppField name="email">
                    {(field) => (
                        <field.TextField
                            label="ایمیل"
                            placeholder="email@example.com"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <AppField name="username">
                    {(field) => (
                        <field.TextField
                            label="نام کاربری"
                            placeholder="username_123"
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

                <AppField name="confirmPassword">
                    {(field) => (
                        <field.TextField
                            type="password"
                            label="تایید رمز عبور"
                            placeholder="Password123!"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <AppForm>
                    <SubmitButton
                        isLoading={isLoading}
                        className="w-full rounded-md bg-primary py-3 text-sm text-primary-foreground cursor-pointer"
                    >
                        ساخت حساب
                    </SubmitButton>
                </AppForm>
            </div>
        </form>
    );
}
