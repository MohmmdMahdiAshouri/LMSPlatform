import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendVerificationTokenDto {
    @ApiProperty({ example: 'mohmmad@example.com' })
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email address' })
    readonly email!: string;

    @ApiProperty({
        example: 'mohmmad_123',
        description:
            'Username must be 3-30 characters long, start with a letter, and can contain letters, numbers, and underscores. No consecutive underscores or ending with an underscore.',
    })
    @IsString()
    @IsNotEmpty()
    readonly username!: string;
}
