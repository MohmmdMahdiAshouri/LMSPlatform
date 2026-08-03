import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    private static readonly SALT_ROUNDS = 12;

    hash(password: string): Promise<string> {
        return bcrypt.hash(password, BcryptPasswordHasher.SALT_ROUNDS);
    }

    compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
