'use client';
import { useAppForm } from '@/shared/features/form/hooks/use-app-form';
import { Lock, RotateCcwKey } from 'lucide-react';
import { useChangePassword } from '../hooks/useAuth';
import {
    changePasswordDefaultValues,
    changePasswordSchema,
} from '../schemas/change-password.schema';
import { useEffect } from 'react';

export default function ChangePassword() {
    const { mutate, isPending, isSuccess } = useChangePassword();
    const { handleSubmit, AppField, AppForm, SubmitButton, reset } = useAppForm({
        defaultValues: changePasswordDefaultValues,
        validators: {
            onChange: changePasswordSchema,
        },
        onSubmit: ({ value }) => {
            mutate(value);
        },
    });
    useEffect(() => {
        if (isSuccess) {
            reset();
        }
    }, [isSuccess, reset]);
    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Lock />
                </div>
                <div>
                    <h2 className="font-semibold text-foreground">
                        تغییر رمز عبور
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        برای امنیت بیشتر، رمز قوی و یکتا انتخاب کنید.
                    </p>
                </div>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                }}
                className="flex flex-col  gap-4"
            >
                <AppField name="currentPassword">
                    {(field) => (
                        <field.TextField
                            type="password"
                            label="رمز عبور فعلی"
                            placeholder="Password123!"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <AppField name="newPassword">
                    {(field) => (
                        <field.TextField
                            type="password"
                            label="رمز عبور جدید"
                            placeholder="Password123!"
                            dir="ltr"
                        />
                    )}
                </AppField>

                <AppForm>
                    <SubmitButton
                        isLoading={isPending}
                        className="w-fit mx-auto text-md"
                    >
                        ذخیره رمز جدید
                        <RotateCcwKey className='size-5' />
                    </SubmitButton>
                </AppForm>
            </form>
        </section>
    );
}
