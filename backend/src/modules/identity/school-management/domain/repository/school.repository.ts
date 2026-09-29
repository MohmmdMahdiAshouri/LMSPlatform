import { School } from '../entities/school.entity';

export abstract class SchoolRepository {
    abstract save(school: School): Promise<void>;

    abstract findById(id: string): Promise<School | null>;
}
