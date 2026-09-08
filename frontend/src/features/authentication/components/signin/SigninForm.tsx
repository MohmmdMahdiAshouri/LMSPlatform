import { useAppForm } from '@/shared/features/form/hooks/use-app-form';
import {
    signinFormDefaultValues,
    signinFormSchema,
    SigninFormValues,
} from '../../schemas/signin.schema';

export function SigninForm({
    onSubmit,
}: {
    onSubmit: (value: SigninFormValues) => Promise<void> | void;
}) {
    const { handleSubmit, AppField, AppForm, SubmitButton, reset } = useAppForm({
        defaultValues: signinFormDefaultValues,
        validators: {
            onChange: signinFormSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
            // reset()
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
                <AppField name="emailOrUsername">
                    {(field) => (
                        <field.TextField
                            label="ایمیل یا نام کاربری"
                            dir="ltr"
                            type="text"
                            placeholder="email@example.com / username_123"
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

                <AppForm>
                    <div className="flex items-center gap-3">
                        <SubmitButton>ورود</SubmitButton>
                    </div>
                </AppForm>
            </form>
        </div>
    );
}
