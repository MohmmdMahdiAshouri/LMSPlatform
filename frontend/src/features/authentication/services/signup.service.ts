import { apiClient } from '@/shared/lib/apiClient';
import { SignupPayloadType, SignupResponseType } from '../types/signup.type';

export async function signupService (payload: SignupPayloadType){
    const response = await apiClient.post<SignupResponseType>('auth/register', payload)
    return response
} 