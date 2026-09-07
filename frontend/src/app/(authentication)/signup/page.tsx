'use client';
import { SignupForm } from '@/features/authentication/components/SignupForm';
import { useSignup } from '@/features/authentication/hooks/useSignup';

export default function Page() {
    const { mutate } = useSignup();

    return (
        <SignupForm onSubmit={(values) => mutate(values)} />
    );
}
