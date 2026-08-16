import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurrentUserQuery } from './get-current-user.query';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens/injection.token';
import { UserRepository } from '@modules/identity/authentication/domain/repositories/user.repository';
import { UserNotFoundException } from '@modules/identity/authentication/domain/exceptions/user-not-found.exception';
import { CurrentUserType } from '../../contracts/current-user';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}
    async execute(query: GetCurrentUserQuery): Promise<CurrentUserType> {
        const user = await this.userRepository.findById(query.userId);
        if (!user) throw new UserNotFoundException();

        return {
            id: user.getId(),
            email: user.getEmail().getValue(),
            username: user.getUsername().getValue(),
            status: user.getStatus(),
            emailVerified: user.getEmailVerifiedAt() === null ? false : true,
            avatarUrl: user.getAvatarUrl(),
        };
    }
}
