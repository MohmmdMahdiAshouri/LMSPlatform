import { randomUUID } from 'crypto';

export class UserSchoolRole {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly schoolId: string,
        private roleId: string,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    static restore(
        id: string,
        userId: string,
        schoolId: string,
        roleId: string,
        createdAt: Date,
        updatedAt: Date,
    ): UserSchoolRole {
        return new UserSchoolRole(id, userId, schoolId, roleId, createdAt, updatedAt);
    }

    static create(userId: string, schoolId: string, roleId: string): UserSchoolRole {
        const now = new Date();
        return new UserSchoolRole(randomUUID(), userId, schoolId, roleId, now, now);
    }

    changeRole(newRoleId: string): void {
        this.roleId = newRoleId;
        this.touch();
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getSchoolId(): string {
        return this.schoolId;
    }

    getRoleId(): string {
        return this.roleId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}
