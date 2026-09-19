import { cn } from '@/shared/lib/client/client-utils';

interface AppContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function AppContainer({ children, className }: AppContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full h-full max-w-7xl px-4 sm:px-6 lg:px-8',
                className,
            )}
        >
            {children}
        </div>
    );
}
