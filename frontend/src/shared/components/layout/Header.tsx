'use client';
import { Bell, CircleHelp, LogIn, Search, Sparkles, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrentUser } from '@/features/authentication/hooks/useAuth';

function UserSkeleton() {
    return (
        <div className="size-8 animate-pulse rounded-full bg-muted-foreground" />
    );
}

export default function Header() {
    const { data: user, isPending } = useCurrentUser();
    
    return (
        <header className="grid grid-cols-3 border-b-2 border-primary px-8 py-5 bg-card">
            <div className="flex items-center gap-x-2 text-muted-foreground">
                <Image
                    className="rounded-full"
                    src="/images/icon.png"
                    alt=""
                    width={60}
                    height={60}
                />
                سامانه مدیریت یادگیری کلاس برتر
            </div>

            <div className="flex w-150 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted-foreground">
                <Search className="size-3.75 shrink-0" />

                <span className="flex-1 text-sm">
                    جستجوی دوره‌ها، درس‌ها و افراد…
                </span>

                <span className="flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-xs">
                    ⌘<span>K</span>
                </span>
            </div>

            <div className="mr-auto flex items-center gap-2">
                <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-muted-foreground"
                >
                    <Sparkles className="size-3.5 text-primary" />
                    <span>پرسش از هوش مصنوعی</span>
                </button>

                <button
                    type="button"
                    className="relative flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
                >
                    <Bell className="size-4" />

                    <span className="absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        3
                    </span>
                </button>

                <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
                >
                    <CircleHelp className="size-4" />
                </button>

                {false ? (
                    <UserSkeleton />
                ) : (
                    <>
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 size-8"
                            >
                                {user?.avatarUrl ? (
                                    <Image
                                        src={user?.avatarUrl}
                                        width={40}
                                        height={40}
                                        alt={user.username}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <User className="size-6" />
                                )}
                            </Link>
                        ) : (
                            <Link
                                href="/auth"
                                className="flex justify-center items-center size-8"
                            >
                                <LogIn />
                            </Link>
                        )}
                    </>
                )}
            </div>
        </header>
    );
}
