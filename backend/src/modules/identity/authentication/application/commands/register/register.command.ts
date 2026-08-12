import { AuthenticationContext } from '../../contracts/authentication-context';

export class RegisterCommand {
    constructor(
        public readonly email: string,
        public readonly username: string,
        public readonly password: string,
        public readonly context: AuthenticationContext,
    ) {}
}
