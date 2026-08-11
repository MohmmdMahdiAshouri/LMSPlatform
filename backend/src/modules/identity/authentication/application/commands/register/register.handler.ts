import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { User } from '@modules/identity/authentication/domain/entities/user.entity';
import { UsernameAlreadyExistsException } from '@modules/identity/authentication/domain/exceptions/username-already-exists.exception';
import { EmailAlreadyExistsException } from '@modules/identity/authentication/domain/exceptions/email-already-exists.exception';
import { RegisterCommand } from './register.command';
import type { PasswordHasher } from '../../ports/password-hasher.port';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../tokens/injection.token';
import { Email } from '@modules/identity/authentication/domain/value-objects/email.vo';
import { Username } from '@modules/identity/authentication/domain/value-objects/username.vo';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { PasswordHash } from '@modules/identity/authentication/domain/value-objects/password-hash.vo';
import { VerificationTokenService } from '../../services/verification-token.service';
import { Transactional } from '@nestjs-cls/transactional';
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,

        private readonly verificationTokenService: VerificationTokenService,
    ) {}
    @Transactional()
    async execute(command: RegisterCommand): Promise<{ email: string; username: string }> {
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

        // Create and send a verification token for the user
        await this.verificationTokenService.create(user);

        return { email: email.getValue(), username: username.getValue() };
    }
}
