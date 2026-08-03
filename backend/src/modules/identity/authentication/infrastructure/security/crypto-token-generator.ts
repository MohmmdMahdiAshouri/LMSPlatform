import { Injectable } from '@nestjs/common';
import { TokenGenerator } from '../../application/ports/token-generator.port';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoTokenGenerator implements TokenGenerator {
    generate(length = 32): string {
        return randomBytes(length).toString('hex');
    }
}
