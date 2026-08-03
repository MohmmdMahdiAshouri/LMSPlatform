import { Injectable } from '@nestjs/common';
import { Clock } from '../../application/ports/clock.port';

@Injectable()
export class SystemClock implements Clock {
    now(): Date {
        return new Date();
    }
}
