import { Injectable } from '@nestjs/common';
import { TokenHasher } from '../../application/ports/token-hasher.port';
import { createHash } from 'crypto';

@Injectable()
export class Sha256TokenHasher implements TokenHasher {
    hash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
