import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/shared/lib/client/client-utils';
import { Providers } from '../shared/components/layout/Providers';
import { AppContainer } from '@/shared/components/layout/AppContainer';
import Header from '@/shared/components/layout/Header';

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
    return (
        <html
            dir="rtl"
            lang="fa"
            className={cn('h-full antialiased', vazir.variable)}
        >
            <body className="min-h-full min-w-full flex flex-col">
                <Providers>
                    {/* <AuthProvider> */}
                    <Header />
                    <AppContainer>{children}</AppContainer>
                    {/* </AuthProvider> */}
                </Providers>
            </body>
        </html>
    );
}
