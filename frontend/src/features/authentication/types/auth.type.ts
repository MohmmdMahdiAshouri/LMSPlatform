import { SignInFormValues } from '../schemas/signIn.schema';
import { SignUpFormValues } from '../schemas/signUp.schema';

export type AuthTabsType = 'signIn' | 'signUp';

export type signUpPayloadType = Omit<SignUpFormValues, 'confirmPassword'>;

export interface signUpResponseType {
    accessToken: string;
}

export type signInPayloadType = SignInFormValues;

export interface signInResponseType {
    accessToken: string;
}

export interface ResetPassword {
    token: string;
    password: string;
}
