import { SetMetadata } from '@nestjs/common';
import { NO_WRAP_RESPONSE } from '../constants/response.constants';

export const NoWrap = (): MethodDecorator => SetMetadata(NO_WRAP_RESPONSE, true);
