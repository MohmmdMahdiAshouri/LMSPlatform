'use client';
import { signUpForm } from '@/features/authentication/components/signUp/signUpForm';
import { usesignUp } from '@/features/authentication/hooks/usesignUp';

export default function signUpPage() {
    const { mutate } = usesignUp();

    return <signUpForm onSubmit={mutate} />;
}
