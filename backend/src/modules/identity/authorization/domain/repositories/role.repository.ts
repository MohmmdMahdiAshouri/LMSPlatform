import { Role } from '../entities/role.entity';

export abstract class RoleRepository {
    abstract save(role: Role): Promise<void>;

    abstract findById(id: string): Promise<Role | null>;

    abstract findBySchoolIdAndName(schoolId: string, name: string): Promise<Role | null>;

    abstract delete(id: string): Promise<void>;
}
