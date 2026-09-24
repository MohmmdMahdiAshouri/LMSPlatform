'use client';
import {
    LogOut,
    Monitor,
    ScreenShareOff,
    Smartphone,
    Tablet,
    X,
} from 'lucide-react';
import {
    useLogoutAll,
    useLogoutCurrent,
    useLogoutSpecific,
    useSessions,
} from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button';

export default function SessionsManagement() {
    const { data: sessions } = useSessions();

    const { mutate, isPending } = useLogoutCurrent();

    const { mutate: logoutAll, isPending: logoutAllPending } = useLogoutAll();

    const { mutate: logoutSpecific, isPending: logoutSpecificPending } =
        useLogoutSpecific();

    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <Monitor />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            نشست‌های فعال
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            دستگاه‌ها و مرورگرهایی که به حساب شما وارد شده‌اند.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        onClick={() => mutate()}
                        disabled={isPending}
                        size={'lg'}
                        variant={'destructive'}
                    >
                        خروج از نشست فعلی
                        <LogOut className="size-5" />
                    </Button>
                    <Button
                        onClick={() => logoutAll()}
                        disabled={logoutAllPending}
                        size={'lg'}
                        variant={'destructive'}
                    >
                        خروج از همه دستگاه‌ها
                        <ScreenShareOff className="size-5" />
                    </Button>
                </div>
            </div>

            <ul className="divide-y divide-border">
                {sessions?.map(
                    ({
                        browser,
                        deviceType,
                        id,
                        os,
                        expiresAt,
                        lastActivityAt,
                        isCurrent,
                    }) => (
                        <li
                            key={id}
                            className="flex items-center justify-between gap-4 py-4 flex-wrap"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                        isCurrent
                                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                                            : 'bg-muted text-ink-muted'
                                    }`}
                                >
                                    {deviceType === 'MOBILE' ? (
                                        <Smartphone />
                                    ) : deviceType === 'TABLET' ? (
                                        <Tablet />
                                    ) : (
                                        <Monitor />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium text-foreground truncate">
                                            {deviceType}
                                        </p>
                                        {isCurrent && (
                                            <span className="inline-flex items-center rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
                                                نشست فعلی
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-0.5 flex gap-x-3">
                                        <span>مرورگر: {browser}</span>
                                        <span>سیستم عامل: {os}</span>
                                        <span>
                                            آخرین فعالیت:{' '}
                                            {new Date(
                                                lastActivityAt,
                                            ).toLocaleString('fa-IR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span>
                                            تاریخ انقضا:{' '}
                                            {new Date(expiresAt).toLocaleString(
                                                'fa-IR',
                                                {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {!isCurrent && (
                                <Button
                                    onClick={() => logoutSpecific(id)}
                                    disabled={logoutSpecificPending}
                                    variant={'outline'}
                                >
                                    خروج از این نشست
                                    <X />
                                </Button>
                            )}
                        </li>
                    ),
                )}
            </ul>
        </section>
    );
}
