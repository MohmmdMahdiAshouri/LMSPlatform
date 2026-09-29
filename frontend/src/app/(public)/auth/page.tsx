'use client';
import { AuthBrandPanel } from '@/features/authentication/components/AuthBrandPanel';
import { AuthTabs } from '@/features/authentication/components/AuthTabs';
import { AuthFooter } from '@/features/authentication/components/AuthFooter';
import { SignInForm } from '@/features/authentication/components/SignInForm';
import { AuthHeader } from '@/features/authentication/components/AuthHeader';
import { useSignIn, useSignUp } from '@/features/authentication/hooks/useAuth';
import { useState } from 'react';
import { AuthTabsType } from '@/features/authentication/types/auth.type';
import SignUpForm from '@/features/authentication/components/SignUpForm';

export default function AuthPage() {
    const [authTab, setAuthTab] = useState<AuthTabsType>('signIn');

    const signUp = useSignUp();

    const signIn = useSignIn();

    return (
        <main className="container">
            <div className="flex justify-between items-center h-screen">
                <section className="w-5/12 h-full p-5 lg:px-10">
                    <AuthHeader />

                    <AuthTabs authTab={authTab} setAuthTab={setAuthTab} />

                    {authTab === 'signUp' ? (
                        <SignUpForm
                            onSubmit={signUp.mutate}
                            isLoading={signUp.isPending}
                        />
                    ) : (
                        <SignInForm
                            onSubmit={signIn.mutate}
                            isLoading={signIn.isPending}
                        />
                    )}

                    <AuthFooter />
                </section>

                <AuthBrandPanel />
            </div>
        </main>
    );
}
