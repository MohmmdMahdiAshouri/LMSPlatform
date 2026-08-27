import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const adapter = new PrismaPg({
    connectionString: configService.getOrThrow<string>('DATABASE_URL'),
});
const prisma = new PrismaClient({ adapter });

const PERMISSIONS: Array<{ key: string; description: string }> = [
    { key: 'course:create', description: 'Create a new course within a school' },
    { key: 'course:update', description: 'Update course details within a school' },
    { key: 'course:delete', description: 'Delete a course within a school' },
    { key: 'lesson:create', description: 'Create a new lesson within a school course' },
    { key: 'lesson:update', description: 'Update lesson details within a school course' },
    { key: 'role:create', description: 'Create a custom role within a school' },
    { key: 'role:update', description: 'Update a custom role within a school' },
    { key: 'role:delete', description: 'Delete a custom role within a school' },
    { key: 'role:assign', description: 'Assign or change a role for a school member' },
    { key: 'member:invite', description: 'Invite a new member to a school' },
];

async function main(): Promise<void> {
    try {
        for (const permission of PERMISSIONS) {
            await prisma.permission.upsert({
                where: { key: permission.key },
                update: {},
                create: {
                    key: permission.key,
                    description: permission.description,
                },
            });
            console.log(`✓ Upserted permission: ${permission.key}`);
        }
        console.log(`Seeded ${PERMISSIONS.length} permissions successfully.`);
    } catch (error) {
        console.error('Failed to seed permissions:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

void main();
