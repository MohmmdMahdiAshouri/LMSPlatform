import { AuthenticationContext } from '../../contracts/authentication-context';

export class LoginCommand {
    constructor(
        public readonly emailOrUsername: string,
        public readonly password: string,
        public readonly context: AuthenticationContext,
    ) {}
}
