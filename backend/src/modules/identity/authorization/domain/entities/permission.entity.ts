import { randomUUID } from 'crypto';

export class Permission {
    private constructor(
        private readonly id: string,
        private readonly key: string,
        private readonly description: string,
        private readonly createdAt: Date,
    ) {}

    static restore(id: string, key: string, description: string, createdAt: Date): Permission {
        return new Permission(id, key, description, createdAt);
    }

    static create(key: string, description: string): Permission {
        return new Permission(randomUUID(), key, description, new Date());
    }

    getId(): string {
        return this.id;
    }

    getKey(): string {
        return this.key;
    }

    getDescription(): string {
        return this.description;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
