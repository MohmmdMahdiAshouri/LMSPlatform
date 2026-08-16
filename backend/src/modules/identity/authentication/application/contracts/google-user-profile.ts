export interface GoogleUserProfile {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
}
