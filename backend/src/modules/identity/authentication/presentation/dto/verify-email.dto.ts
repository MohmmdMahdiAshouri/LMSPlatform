import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({
        example: 'your-verification-token',
        description: "The verification token sent to the user's email for email verification.",
    })
    @IsNotEmpty({ message: 'Verification token is required' })
    @IsString()
    @IsNotEmpty()
    readonly verificationToken!: string;
}
