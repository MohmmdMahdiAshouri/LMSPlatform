import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { BaseError } from '../base.error';
import { NotFoundError } from '../common/not-found.error';
import { ValidationError } from '../common/validation.error';
import { UnauthorizedError } from '../common/unauthorized.error';
import { ForbiddenError } from '../common/forbidden.error';
import { ConflictError } from '../common/conflict.error';
import { InfrastructureError } from '../base/infrastructure.error';
import { ApiResponse } from '@shared/common/response-fromat/api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const correlationId = (request.headers['x-request-id'] as string) ?? randomUUID();

        const { statusCode, code, message, details } = this.resolve(exception);

        if (exception instanceof BaseError && exception.isOperational) {
            this.logger.warn(`[${correlationId}] ${code}: ${message}`, JSON.stringify(exception.metadata ?? {}));
        } else {
            this.logger.error(
                `[${correlationId}] Unhandled/Infra error: ${message}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        const body: ApiResponse<null> = {
            success: false,
            message,
            statusCode,
            data: null,
            correlationId,
            userIP: request.ip,
            timestamp: new Date().toISOString(),
            error: {
                code,
                ...(details ? { details } : {}),
            },
        };

        response.status(statusCode).json(body);
    }

    private resolve(exception: unknown): {
        statusCode: number;
        code: string;
        message: string;
        details?: Array<{ field: string; message: string }>;
    } {
        if (exception instanceof ValidationError) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                code: exception.code,
                message: exception.message,
                details: exception.fieldErrors,
            };
        }
        if (exception instanceof NotFoundError) {
            return { statusCode: HttpStatus.NOT_FOUND, code: exception.code, message: exception.message };
        }
        if (exception instanceof UnauthorizedError) {
            return { statusCode: HttpStatus.UNAUTHORIZED, code: exception.code, message: exception.message };
        }
        if (exception instanceof ForbiddenError) {
            return { statusCode: HttpStatus.FORBIDDEN, code: exception.code, message: exception.message };
        }
        if (exception instanceof ConflictError) {
            return { statusCode: HttpStatus.CONFLICT, code: exception.code, message: exception.message };
        }
        if (exception instanceof BaseError && exception.layer === 'domain') {
            return { statusCode: HttpStatus.UNPROCESSABLE_ENTITY, code: exception.code, message: exception.message };
        }
        if (exception instanceof InfrastructureError) {
            return {
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                code: exception.code,
                message: 'A temporary error has occurred; please try again',
            };
        }
        if (exception instanceof BaseError) {
            return { statusCode: HttpStatus.BAD_REQUEST, code: exception.code, message: exception.message };
        }
        if (exception instanceof HttpException) {
            return { statusCode: exception.getStatus(), code: 'FRAMEWORK.HTTP_EXCEPTION', message: exception.message };
        }
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'SHARED.UNEXPECTED_ERROR',
            message: 'An internal server error occurred.',
        };
    }
}
