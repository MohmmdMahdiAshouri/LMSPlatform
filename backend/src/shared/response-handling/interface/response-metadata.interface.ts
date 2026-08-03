import { HttpStatus } from '@nestjs/common';

export interface ResponseMetadata {
    statusCode?: HttpStatus;
    message?: string;
}
