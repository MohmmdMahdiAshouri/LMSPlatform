import { InvalidPasswordhashException } from '../exceptions/invalid-passwordhash.exception';

export class PasswordHash {
    private constructor(private readonly value: string) {}

    static create(hash: string): PasswordHash {
        if (!hash) {
            throw new InvalidPasswordhashException(hash);
        }

        return new PasswordHash(hash);
    }

    getValue(): string {
        return this.value;
    }
}
