import { PasswordResetToken } from '../entities/password-reset-token.entity';

export abstract class PasswordResetTokenRepository {
    abstract save(passwordResetToken: PasswordResetToken): Promise<void>;

    abstract update(passwordResetToken: PasswordResetToken): Promise<void>;

    abstract findById(id: string): Promise<PasswordResetToken | null>;

    abstract findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;

    abstract findActiveByUserId(userId: string): Promise<PasswordResetToken | null>;

    abstract delete(id: string): Promise<void>;
}
