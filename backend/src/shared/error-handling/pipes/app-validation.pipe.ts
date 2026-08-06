import { Injectable, ValidationPipe } from '@nestjs/common';
import type { ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError as AppValidationError } from '../common/validation.error';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors: ClassValidatorError[]) => {
                const fieldErrors = AppValidationPipe.flattenErrors(errors);
                return new AppValidationError(fieldErrors);
            },
        });
    }

    private static flattenErrors(
        errors: ClassValidatorError[],
        parentPath = '',
    ): Array<{ field: string; message: string }> {
        const result: Array<{ field: string; message: string }> = [];
        for (const err of errors) {
            const path = parentPath ? `${parentPath}.${err.property}` : err.property;
            if (err.constraints) {
                result.push({ field: path, message: Object.values(err.constraints).join(', ') });
            }
            if (err.children?.length) {
                result.push(...AppValidationPipe.flattenErrors(err.children, path));
            }
        }
        return result;
    }
}
