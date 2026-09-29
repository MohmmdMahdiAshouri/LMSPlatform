import { Permission } from '../entities/permission.entity';

export abstract class PermissionRepository {
    abstract findAll(): Promise<Permission[]>;

    abstract findById(id: string): Promise<Permission | null>;
}
