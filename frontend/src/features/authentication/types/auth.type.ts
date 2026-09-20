import { SignInFormValues } from '../schemas/signIn.schema';
import { SignUpFormValues } from '../schemas/signUp.schema';

export type AuthTabsType = 'signIn' | 'signUp';

export type SignUpPayloadType = Omit<SignUpFormValues, 'confirmPassword'>;

export interface SignUpResponseType {
    accessToken: string;
}

export type SignInPayloadType = SignInFormValues;

export interface SignInResponseType {
    accessToken: string;
}

export interface ResetPassword {
    token: string;
    password: string;
}

export type AuthStoreType = {
    accessToken: string | null;
    setAccessToken: (accessToken: string | null) => void;
    clear: () => void;
};

export interface CurrentUser {
    id: string;
    email: string;
    username: string;
    status: string;
    emailVerified: boolean;
    avatarUrl: string | null;
}

type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
export interface session {
    id: string;
    deviceType: DeviceType;
    browser: string;
    os: string;
    lastActivityAt: Date;
    expiresAt: Date;
    isCurrent: boolean
}