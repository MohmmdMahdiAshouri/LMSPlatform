import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'mohmmad@example.com' })
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email address' })
    readonly email!: string;
}
