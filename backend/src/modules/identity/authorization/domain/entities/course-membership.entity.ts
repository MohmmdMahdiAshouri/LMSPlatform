import { randomUUID } from 'crypto';
import { CourseRole } from '../enums/course-role.enum';

export class CourseMembership {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly courseId: string,
        private readonly courseRole: CourseRole,
        private readonly assignedBy: string,
        private readonly createdAt: Date,
    ) {}

    static restore(
        id: string,
        userId: string,
        courseId: string,
        courseRole: CourseRole,
        assignedBy: string,
        createdAt: Date,
    ): CourseMembership {
        return new CourseMembership(id, userId, courseId, courseRole, assignedBy, createdAt);
    }

    static create(userId: string, courseId: string, courseRole: CourseRole, assignedBy: string): CourseMembership {
        return new CourseMembership(randomUUID(), userId, courseId, courseRole, assignedBy, new Date());
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getCourseId(): string {
        return this.courseId;
    }

    getCourseRole(): CourseRole {
        return this.courseRole;
    }

    getAssignedBy(): string {
        return this.assignedBy;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
