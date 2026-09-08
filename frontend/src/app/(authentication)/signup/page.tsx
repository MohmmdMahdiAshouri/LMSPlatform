'use client';
import { SignupForm } from '@/features/authentication/components/signup/SignupForm';
import { useSignup } from '@/features/authentication/hooks/useSignup';

export default function SignupPage() {
    const { mutate } = useSignup();

    return <SignupForm onSubmit={mutate} />;
}
