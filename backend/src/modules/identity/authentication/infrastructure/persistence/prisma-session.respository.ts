import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SessionMapper } from '../mappers/session.mapper';
import { Session } from '../../domain/entities/session.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
    constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

    async save(session: Session): Promise<void> {
        await this.txHost.tx.session.create({
            data: SessionMapper.toPersistence(session),
        });
    }

    async update(session: Session): Promise<void> {
        await this.txHost.tx.session.update({
            where: {
                id: session.getId(),
            },
            data: SessionMapper.toPersistence(session),
        });
    }

    async findById(id: string): Promise<Session | null> {
        const session = await this.txHost.tx.session.findUnique({
            where: { id },
        });

        if (!session) return null;

        return SessionMapper.toDomain(session);
    }

    async delete(id: string): Promise<void> {
        await this.txHost.tx.session.delete({
            where: { id },
        });
    }
}
