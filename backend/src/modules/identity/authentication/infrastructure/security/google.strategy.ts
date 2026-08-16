import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { GoogleUserProfile } from '../../application/contracts/google-user-profile';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        });
    }

    validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
        const email = profile.emails?.[0];

        if (!email) {
            done(new Error('Google profile has no email.'));
            return;
        }

        const googleUser: GoogleUserProfile = {
            googleId: profile.id,
            email: email.value.toLowerCase(),
            emailVerified: email.verified ?? false,
            name: profile.displayName ?? '',
            givenName: profile.name?.givenName,
            familyName: profile.name?.familyName,
            picture: profile.photos?.[0]?.value,
        };

        done(null, googleUser); // ends up in req.user
    }
}
