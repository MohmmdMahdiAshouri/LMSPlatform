import { Email } from '../value-objects/email.vo';
import { Username } from '../value-objects/username.vo';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
    abstract save(user: User): Promise<void>;

    abstract update(user: User): Promise<void>;

    abstract findById(id: string): Promise<User | null>;

    abstract findByEmail(email: Email): Promise<User | null>;

    abstract findByUsername(username: Username): Promise<User | null>;

    abstract existsByEmail(email: Email): Promise<boolean>;

    abstract existsByUsername(username: Username): Promise<boolean>;

    abstract delete(id: string): Promise<void>;
}
