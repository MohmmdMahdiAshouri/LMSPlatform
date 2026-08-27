import { randomUUID } from 'crypto';

export class Role {
    private constructor(
        private readonly id: string,
        private readonly schoolId: string,
        private name: string,
        private readonly isSystem: boolean,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        schoolId: string,
        name: string,
        isSystem: boolean,
        createdAt: Date,
        updatedAt: Date,
    ): Role {
        return new Role(id, schoolId, name, isSystem, createdAt, updatedAt);
    }

    static create(schoolId: string, name: string): Role {
        const now = new Date();
        return new Role(randomUUID(), schoolId, name, false, now, now);
    }

    static createSystemRole(schoolId: string, name: string): Role {
        const now = new Date();
        return new Role(randomUUID(), schoolId, name, true, now, now);
    }

    rename(newName: string): void {
        this.name = newName;
        this.touch();
    }

    isOwnerRole(): boolean {
        return this.isSystem;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    getId(): string {
        return this.id;
    }

    getSchoolId(): string {
        return this.schoolId;
    }

    getName(): string {
        return this.name;
    }

    getIsSystem(): boolean {
        return this.isSystem;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
