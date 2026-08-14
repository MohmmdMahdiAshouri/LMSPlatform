import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { Password } from '@modules/identity/authentication/domain/value-objects/password.vo';
import { Inject } from '@nestjs/common';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { PasswordSameAsOldException } from '@modules/identity/authentication/domain/exceptions/password-same-as-old.exception';
import { PasswordHash } from '@modules/identity/authentication/domain/value-objects/password-hash.vo';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordIsIncorrectException } from '@modules/identity/authentication/domain/exceptions/password-is-incorrect.exception';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,

        private readonly authenticationService: AuthenticationService,
    ) {}
    async execute(command: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new UserNotFoundException();
        }
        const currentPassword = Password.create(command.currentPassword);
        const newPassword = Password.create(command.newPassword);

        const isValidCurrentPassword = await this.passwordHasher.compare(currentPassword, user.getPasswordHash());
        if (!isValidCurrentPassword) throw new PasswordIsIncorrectException();

        const isSamePassword = await this.passwordHasher.compare(newPassword, user.getPasswordHash());
        if (isSamePassword) throw new PasswordSameAsOldException();

        const hash = await this.passwordHasher.hash(newPassword);

        user.changePassword(PasswordHash.create(hash));
        await this.userRepository.update(user);

        //logout all sessions
        await this.authenticationService.revokeAllSessionsExcept(user.getId(), command.sessionId);
    }
}
