import { Injectable } from '@nestjs/common';
import { SchoolRepository } from '../../domain/repository/school.repository';
import { School } from '../../domain/entities/school.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { SchoolMapper } from '../mapper/school.mapper';

@Injectable()
export class PrismaSchoolRepository implements SchoolRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(school: School): Promise<void> {
        await this.txHost.tx.school.create({
            data: SchoolMapper.toPersistence(school),
        });
    }

    async findById(id: string): Promise<School | null> {
        const school = await this.txHost.tx.school.findUnique({
            where: { id },
        });

        if (!school) return null;

        return SchoolMapper.toDomain(school);
    }
}
