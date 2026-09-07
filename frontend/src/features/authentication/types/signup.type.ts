import { SignupFormValues } from '../schemas/signup.schema';

export type SignupPayloadType = Omit<SignupFormValues, 'confirmPassword'>

export interface SignupResponseType {
    accessToken: string
}