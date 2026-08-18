import { InvalidEmailException } from '../exceptions/invalid-email.exception';

export class Email {
    private constructor(private readonly value: string) {}

    static create(email: string): Email {
        const normalized = email.trim().toLowerCase();

        if (!this.isValid(normalized)) {
            throw new InvalidEmailException(normalized);
        }

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    private static isValid(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
