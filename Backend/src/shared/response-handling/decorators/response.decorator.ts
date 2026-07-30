import { SetMetadata } from '@nestjs/common';
import { RESPONSE_METADATA } from '../constants/response.constants';
import { ResponseMetadata } from '../interface/response-metadata.interface';

export const Response = (metadata: ResponseMetadata): MethodDecorator => SetMetadata(RESPONSE_METADATA, metadata);
