export abstract class BaseError extends Error {
    public abstract readonly code: string;

    public abstract readonly layer: 'domain' | 'application' | 'infrastructure';
    public readonly metadata?: Record<string, unknown>;

    public readonly isOperational: boolean = true;

    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message);
        this.name = this.constructor.name;
        this.metadata = metadata;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
