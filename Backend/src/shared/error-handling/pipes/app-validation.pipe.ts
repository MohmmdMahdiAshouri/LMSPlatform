import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError as AppValidationError } from '../common/validation.error';

@Injectable()
export class AppValidationPipe implements PipeTransform<unknown> {
    async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
        if (!metatype || !this.shouldValidate(metatype)) return value;

        const targetType = metatype as ClassConstructor<object>;
        const object: object = plainToInstance<object, unknown>(targetType, value);

        const errors = await validate(object);

        if (errors.length > 0) {
            const fieldErrors = errors.map((err) => ({
                field: err.property,
                message: Object.values(err.constraints ?? {}).join(', '),
            }));
            throw new AppValidationError(fieldErrors);
        }
        return object;
    }

    private shouldValidate(metatype: new (...args: unknown[]) => unknown): boolean {
        const primitives: Array<unknown> = [String, Boolean, Number, Array, Object];
        return !primitives.includes(metatype);
    }
}
