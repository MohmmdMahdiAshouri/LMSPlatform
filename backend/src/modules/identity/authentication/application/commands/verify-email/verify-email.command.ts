import { AuthenticationContext } from '../../contracts/authentication-context';

export class VerifyEmailCommand {
    constructor(
        public readonly verificationToken: string,
        public readonly context: AuthenticationContext,
    ) {}
}
