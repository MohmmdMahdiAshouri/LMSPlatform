import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1">
            <aside className="w-60 p-5 bg-card">
                <ul className="text-background">
                    <li>
                        <Link
                            href={'dashboard'}
                            className="bg-foreground p-2 rounded-lg flex items-center gap-3"
                        >
                            <LayoutDashboard className="size-5" />
                            مدیریت حساب کاربری
                        </Link>
                    </li>
                </ul>
            </aside>
            <main className="flex-1 overflow-y-auto py-6 px-15 bg-secondary/50">
                {children}
            </main>
        </div>
    );
}
