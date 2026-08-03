export abstract class PasswordHasher {
    abstract hash(password: string): Promise<string>;
    abstract compare(plain: string, hash: string): Promise<boolean>;
}
