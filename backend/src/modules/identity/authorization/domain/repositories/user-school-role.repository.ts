import { UserSchoolRole } from '../entities/user-school-role.entity';

export abstract class UserSchoolRoleRepository {
    abstract save(userSchoolRole: UserSchoolRole): Promise<void>;

    abstract findByUserIdAndSchoolId(userId: string, schoolId: string): Promise<UserSchoolRole | null>;

    abstract deleteByUserIdAndSchoolId(userId: string, schoolId: string): Promise<void>;
}
