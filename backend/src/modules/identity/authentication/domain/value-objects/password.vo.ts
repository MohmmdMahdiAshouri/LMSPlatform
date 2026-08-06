import { PasswordIsWeakException } from '../exceptions/password-is-weak.exception';

export class Password {
    /**
     * Rules:
     * - minimum 8
     * - maximum 64
     * - uppercase
     * - lowercase
     * - digit
     * - special character
     */

    private static readonly PASSWORD_REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;

    private constructor(private readonly value: string) {}

    static create(password: string): Password {
        if (!this.PASSWORD_REGEX.test(password)) {
            throw new PasswordIsWeakException();
        }

        return new Password(password);
    }

    getValue(): string {
        return this.value;
    }
}
