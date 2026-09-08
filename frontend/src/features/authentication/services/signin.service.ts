import { apiClient } from '@/shared/lib/apiClient';
import { SigninFormValues } from '../schemas/signin.schema';
import { SigninResponseType } from '../types/signin.type';

export async function signinService(payload: SigninFormValues) {
    const response = await apiClient.post<SigninResponseType>('auth/login', payload)
    return response.data
}