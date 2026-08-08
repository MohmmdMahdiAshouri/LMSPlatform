import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
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

    @ApiProperty({
        example: 'Password123!',
        description:
            'Password must be at least 8 characters long and no more than 64 characters long.It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(64, { message: 'Password must be lower than 64 characters long' })
    readonly password!: string;
}
