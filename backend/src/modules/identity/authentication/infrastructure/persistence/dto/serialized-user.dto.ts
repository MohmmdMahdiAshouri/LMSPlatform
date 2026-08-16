// infrastructure/persistence/dto/serialized-user.dto.ts
import { IsString, IsISO8601, IsOptional, IsUUID, IsEnum, IsInt, Min, IsEmail } from 'class-validator';
import { UserStatus } from '../../../domain/enums/user-status.enum';

export class SerializedUserDto {
    @IsUUID()
    id!: string;

    @IsEmail()
    email!: string;

    @IsString()
    username!: string;

    @IsOptional()
    @IsString()
    passwordHash!: string | null;

    @IsOptional()
    @IsString()
    googleId!: string | null;

    @IsOptional()
    @IsString()
    avatarUrl!: string | null;

    @IsOptional()
    @IsISO8601()
    emailVerifiedAt!: string | null;

    @IsEnum(UserStatus)
    status!: UserStatus;

    @IsInt()
    @Min(0)
    failedLoginAttempts!: number;

    @IsOptional()
    @IsISO8601()
    lockedUntil!: string | null;

    @IsOptional()
    @IsISO8601()
    lastLoginAt!: string | null;

    @IsISO8601()
    createdAt!: string;

    @IsISO8601()
    updatedAt!: string;
}
