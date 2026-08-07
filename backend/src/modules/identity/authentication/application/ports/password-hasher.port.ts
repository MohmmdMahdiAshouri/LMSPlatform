import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { Password } from '../../domain/value-objects/password.vo';

export abstract class PasswordHasher {
    abstract hash(password: Password): Promise<string>;
    abstract compare(plain: Password, hash: PasswordHash): Promise<boolean>;
}
