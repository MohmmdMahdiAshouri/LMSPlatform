import { InvalidUsernameException } from '../exceptions/invalid-username.exception';

export class Username {
    /**
     * Rules:
     * - 3 ~ 30 characters
     * - starts with letter
     * - letters, numbers, underscore
     * - no consecutive underscores
     * - cannot end with underscore
     */

    private static readonly USERNAME_REGEX = /^(?=.{3,30}$)(?!.*__)[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$/;

    private constructor(private readonly value: string) {}

    static create(username: string): Username {
        const normalized = username.trim();

        if (!this.isValid(normalized)) {
            throw new InvalidUsernameException(normalized);
        }

        return new Username(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Username): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    static isValid(username: string): boolean {
        return this.USERNAME_REGEX.test(username);
    }
}
