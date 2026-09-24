'use client';
import { useResendVerifyEmail } from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { MailCheck, MailPlus, MailWarning } from 'lucide-react';
import { CurrentUser } from '../types/auth.type';

export default function ResendVerifyEmail({ user }: { user: CurrentUser }) {
    const { mutate } = useResendVerifyEmail();

    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm flex-1">
            <div className="grid grid-cols-1 grid-rows-3 h-full gap-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${user.emailVerified ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}
                    >
                        {user.emailVerified ? <MailCheck /> : <MailWarning />}
                    </div>

                    <div>
                        <h2 className="font-semibold text-foreground">
                            وضعیت ایمیل
                        </h2>
                        <p className={`text-sm text-muted-foreground mt-0.5`}>
                            {user.emailVerified
                                ? 'ایمیل شما تأیید شده است.'
                                : 'ایمیل شما هنوز تأیید نشده است. برای فعال‌سازی کامل حساب، آن را تأیید کنید.'}
                        </p>
                    </div>
                </div>

                <div className="text-end w-full">
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {user.email}
                    </p>
                </div>

                {!user.emailVerified && (
                    <Button
                        onClick={() => mutate()}
                        disabled={user?.emailVerified}
                        size={'lg'}
                        className="w-fit mx-auto text-md"
                    >
                        ارسال ایمیل تایید
                        <MailPlus className="size-5" />
                    </Button>
                )}
            </div>
        </section>
    );
}
