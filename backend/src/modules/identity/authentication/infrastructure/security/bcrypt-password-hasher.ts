import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher.port';
import { Password } from '../../domain/value-objects/password.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    private static readonly SALT_ROUNDS = 12;

    hash(password: Password): Promise<string> {
        return bcrypt.hash(password.getValue(), BcryptPasswordHasher.SALT_ROUNDS);
    }

    async hashToValueObject(password: Password): Promise<PasswordHash> {
        return PasswordHash.create(await this.hash(password));
    }

    compare(plain: Password, hashed: PasswordHash): Promise<boolean> {
        return bcrypt.compare(plain.getValue(), hashed.getValue());
    }
}
