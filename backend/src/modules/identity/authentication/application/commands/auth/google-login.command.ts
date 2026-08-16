import { AuthenticationContext } from '../../contracts/authentication-context';
import { GoogleUserProfile } from '../../contracts/google-user-profile';

export class GoogleLoginCommand {
    constructor(
        public readonly profile: GoogleUserProfile,
        public readonly context: AuthenticationContext,
    ) {}
}
