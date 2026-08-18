import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ApiResponse } from '../../common/response-format/api-response';
import { Reflector } from '@nestjs/core';
import { DEFAULT_SUCCESS_MESSAGE, NO_WRAP_RESPONSE, RESPONSE_METADATA } from '../constants/response.constants';
import { ResponseMetadata } from '../interface/response-metadata.interface';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, T | ApiResponse<T>> {
    constructor(private readonly reflector: Reflector) {}

    private buildResponse<T>(data: T, statusCode: number, metadata?: ResponseMetadata): ApiResponse<T> {
        return {
            success: true,
            statusCode: metadata?.statusCode ?? statusCode,
            message: metadata?.message ?? DEFAULT_SUCCESS_MESSAGE,
            data,
            error: null,
            timestamp: new Date().toISOString(),
        };
    }

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | ApiResponse<T>> {
        const shouldSkip = this.reflector.get<boolean>(NO_WRAP_RESPONSE, context.getHandler());

        if (shouldSkip) {
            return next.handle();
        }

        const metadata = this.reflector.get<ResponseMetadata>(RESPONSE_METADATA, context.getHandler());

        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(map((data: T) => this.buildResponse(data, response.statusCode, metadata)));
    }
}
