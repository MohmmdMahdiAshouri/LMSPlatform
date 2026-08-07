import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { User } from '@modules/identity/authentication/domain/entities/user.entity';
import { UsernameAlreadyExistsException } from '@modules/identity/authentication/domain/exceptions/username-already-exists.exception';
import { EmailAlreadyExistsException } from '@modules/identity/authentication/domain/exceptions/email-already-exists.exception';
import { RegisterCommand } from './register.command';
import type { PasswordHasher } from '../../ports/password-hasher.port';
import { PASSWORD_HASHER, USER_REPOSITORY, VERIFICATION_TOKEN_REPOSITORY } from '../../tokens/injection.token';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { Username } from '@modules/identity/authentication/domain/value-objects/username.vo';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { PasswordHash } from '@modules/identity/authentication/domain/value-objects/password-hash.vo';
import { VerificationTokenFactory } from '../../factories/verification-token.factory';
import { VerificationTokenRepository } from '@modules/identity/authentication/domain/repositories/verification-token.repository';
import { UserRegisteredEvent } from '../../events/user-registered.event';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(VERIFICATION_TOKEN_REPOSITORY)
        private readonly verificationTokenRepository: VerificationTokenRepository,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,

        private readonly verificationTokenFactory: VerificationTokenFactory,

        private readonly eventBus: EventBus,
    ) {}
    async execute(command: RegisterCommand): Promise<void> {
        //user registration logic
        const email = Email.create(command.email);
        const username = Username.create(command.username);
        const password = Password.create(command.password);

        const emailExists = await this.userRepository.existsByEmail(email);

        if (emailExists) {
            throw new EmailAlreadyExistsException(email);
        }

        const usernameExists = await this.userRepository.existsByUsername(username);

        if (usernameExists) {
            throw new UsernameAlreadyExistsException(username);
        }

        const hash = await this.passwordHasher.hash(password);

        const user = User.register(email, username, PasswordHash.create(hash));

        await this.userRepository.save(user);

        // Create a verification token for the user
        const result = this.verificationTokenFactory.create(user.getId());

        await this.verificationTokenRepository.save(result.verificationToken);

        this.eventBus.publish(
            new UserRegisteredEvent(
                user.getId(),
                user.getEmail().getValue(),
                user.getUsername().getValue(),
                result.plainToken,
            ),
        );
    }
}
