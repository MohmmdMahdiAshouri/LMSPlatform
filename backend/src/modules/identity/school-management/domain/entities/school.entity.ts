import { randomUUID } from 'crypto';

export class School {
    private constructor(
        private readonly id: string,
        private name: string,
        private readonly ownerId: string,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(id: string, name: string, ownerId: string, createdAt: Date, updatedAt: Date): School {
        return new School(id, name, ownerId, createdAt, updatedAt);
    }

    static create(name: string, ownerId: string): School {
        const now = new Date();
        return new School(randomUUID(), name, ownerId, now, now);
    }

    rename(newName: string): void {
        this.name = newName;
        this.touch();
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getOwnerId(): string {
        return this.ownerId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
