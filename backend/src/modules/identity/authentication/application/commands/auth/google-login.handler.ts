import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GoogleLoginCommand } from './google-login.command';
import { USER_REPOSITORY } from '../../tokens/injection.token';
import type { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { GoogleEmailNotVerifiedException } from '@modules/identity/authentication/domain/exceptions/google-email-not-verified.exception';
import { AccountExistsWithoutGoogleException } from '@modules/identity/authentication/domain/exceptions/account-exists-without-google.exception';
import { UserInactiveException } from '@modules/identity/authentication/domain/exceptions/user-in-active.exception';
import { UserLockedException } from '@modules/identity/authentication/domain/exceptions/user-locked.exception';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { Username } from '@modules/identity/authentication/domain/value-objects/username.vo';
import { User } from '@modules/identity/authentication/domain/entities/user.entity';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthenticationResult } from '../../contracts/authentication-result';
import type { GoogleUserProfile } from '../../contracts/google-user-profile';

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<GoogleLoginCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly authenticationService: AuthenticationService,
    ) {}

    async execute(command: GoogleLoginCommand): Promise<AuthenticationResult> {
        const profile = command.profile;
        if (!profile.emailVerified) {
            throw new GoogleEmailNotVerifiedException();
        }

        const existingUser = await this.userRepository.findByGoogleId(profile.googleId);
        if (existingUser) {
            return this.login(existingUser, command);
        }

        const email = Email.create(profile.email);
        const userByEmail = await this.userRepository.findByEmail(email);
        if (userByEmail) {
            throw new AccountExistsWithoutGoogleException(profile.email);
        }

        const user = await this.register(profile);
        return this.authenticationService.authenticate(user, command.context);
    }

    private async login(user: User, command: GoogleLoginCommand): Promise<AuthenticationResult> {
        if (!user.isActive()) {
            throw new UserInactiveException();
        }

        if (user.isLocked()) {
            throw new UserLockedException(user.getLockedUntil());
        }

        user.recordSuccessfulLogin();
        await this.userRepository.update(user);

        return this.authenticationService.authenticate(user, command.context);
    }

    private async register(profile: GoogleUserProfile): Promise<User> {
        const email = Email.create(profile.email);
        const username = await this.generateUniqueUsername(profile.email);

        const user = User.registerWithGoogle(email, username, profile.googleId, profile.picture ?? null);
        await this.userRepository.save(user);

        return user;
    }

    private async generateUniqueUsername(email: string): Promise<Username> {
        let base = email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 27);

        // Username must start with a letter and be 3-30 chars
        const isBaseStartsWithLowerCaseLetter = /^[a-z]/.test(base);
        if (!isBaseStartsWithLowerCaseLetter) {
            base = `u${base}`.slice(0, 27);
        }
        if (base.length < 3) {
            base = `${base}_user`.slice(0, 30);
        }

        let candidate = base;

        while (await this.userRepository.existsByUsername(Username.create(candidate))) {
            candidate = `${base.slice(0, 22)}_${Math.floor(Math.random() * 100000)}`.slice(0, 30);
        }

        return Username.create(candidate);
    }
}
