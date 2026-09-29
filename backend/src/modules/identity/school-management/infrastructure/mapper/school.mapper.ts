import { School as PrismaSchool } from '@prisma/client';
import { School } from '../../domain/entities/school.entity';

export class SchoolMapper {
    static toDomain(prisma: PrismaSchool): School {
        return School.restore(prisma.id, prisma.name, prisma.ownerId, prisma.createdAt, prisma.updatedAt);
    }

    static toPersistence(school: School) {
        return {
            id: school.getId(),
            name: school.getName(),
            ownerId: school.getOwnerId(),
            createdAt: school.getCreatedAt(),
            updatedAt: school.getUpdatedAt(),
        };
    }
}
