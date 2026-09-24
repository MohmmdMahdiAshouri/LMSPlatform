    import type { Metadata } from 'next';
    import localFont from 'next/font/local';
    import './globals.css';
    import { cn } from '@/shared/lib/client/client-utils';
    import { Providers } from '../shared/components/layout/Providers';
    import Header from '@/shared/components/layout/Header';
    import { getQueryClient } from '@/shared/lib/server/get-query-client';
import { currentUserServer } from '@/features/authentication/services/auth.server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

    export const metadata: Metadata = {
        title: 'LMS Platform',
        description: 'A Learning Management System Platform',
    };

    const vazir = localFont({
        src: [
            {
                path: '../../public/font/vazir/Vazir-Regular-FD.woff2',
                weight: '400',
                style: 'normal',
            },
            {
                path: '../../public/font/vazir/Vazir-Black-FD.woff2',
                weight: '700',
                style: 'normal',
            },
        ],
        variable: '--font-vazir',
    });

    export default async function RootLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {

        const queryClient = getQueryClient()

        await queryClient.query({queryKey: ['auth', 'me'], queryFn: currentUserServer})

        return (
            <html
                dir="rtl"
                lang="fa"
                className={cn('h-full antialiased', vazir.variable)}
            >
                <body className="min-h-full min-w-full flex flex-col">
                    <Providers>
                        <HydrationBoundary state={dehydrate(queryClient)}>
                            <Header/>
                        </HydrationBoundary>
                        {children}
                    </Providers>
                </body>
            </html>
        );
    }
