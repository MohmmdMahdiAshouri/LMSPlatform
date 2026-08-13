import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PasswordResetDto {
    @ApiProperty({ example: 'your-reset-password-token' })
    @IsString()
    @IsNotEmpty()
    readonly token!: string;

    @ApiProperty({
        example: 'Password123!',
        description:
            'Password must be at least 8 characters long and no more than 64 characters long.It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(64, { message: 'Password must be lower than 64 characters long' })
    readonly password!: string;
}
