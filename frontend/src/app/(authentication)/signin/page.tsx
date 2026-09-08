'use client'
import { SigninForm } from '@/features/authentication/components/signin/SigninForm';
import { useSignin } from '@/features/authentication/hooks/useSignin';

export default function SigninPage() {
    const { mutate } = useSignin() 

    return (
        <SigninForm onSubmit={mutate} />
    )
}
