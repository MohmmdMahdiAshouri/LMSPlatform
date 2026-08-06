import { VerificationToken } from '../entities/verification-token.entity';

export abstract class VerificationTokenRepository {
    abstract save(verificationToken: VerificationToken): Promise<void>;

    abstract update(verificationToken: VerificationToken): Promise<void>;

    abstract findById(id: string): Promise<VerificationToken | null>;

    abstract findByTokenHash(tokenHash: string): Promise<VerificationToken | null>;

    abstract findActiveByUserId(userId: string): Promise<VerificationToken | null>;

    abstract delete(id: string): Promise<void>;
}
