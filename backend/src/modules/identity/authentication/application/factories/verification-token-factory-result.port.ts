import { VerificationToken } from '../../domain/entities/verification-token.entity';

export interface VerificationTokenFactoryResult {
    plainToken: string;
    verificationToken: VerificationToken;
}
