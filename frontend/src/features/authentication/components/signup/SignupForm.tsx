'use client';
import { useAppForm } from '@/shared/features/form/hooks/use-app-form';
import {
    signupFormSchema,
    signupFormDefaultValues,
    type SignupFormValues,
} from '../../schemas/signup.schema';

export function SignupForm({
    onSubmit,
}: {
    onSubmit: (values: SignupFormValues) => Promise<void> | void;
}) {
    const { handleSubmit, AppField, SubmitButton, AppForm } = useAppForm({
        defaultValues: signupFormDefaultValues,
        validators: {
            onChange: signupFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <form
                className="w-1/2 p-5 grid grid-cols-2 gap-5 rounded-2xl bg-blue-950"
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                }}
            >
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
                            dir="ltr"
                            label="تکرار رمز عبور"
                        />
                    )}
                </AppField>

                <AppForm>
                    <div className="flex items-center gap-3">
                        <SubmitButton>ثبت نام</SubmitButton>
                    </div>
                </AppForm>
            </form>
        </div>
    );
}
