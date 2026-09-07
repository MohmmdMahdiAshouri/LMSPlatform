import { apiClient } from '@/shared/lib/apiClient';
import { SignupPayloadType, SignupResponseType } from '../types/signup.type';

export async function signupService (data: SignupPayloadType){
    const response = await apiClient.post<SignupResponseType>('auth/register', data)
    return response.data
} 