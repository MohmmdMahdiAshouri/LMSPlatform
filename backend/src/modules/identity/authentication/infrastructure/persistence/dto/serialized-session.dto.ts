// infrastructure/persistence/dto/serialized-session.dto.ts
import { IsString, IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { SessionStatus, DeviceType } from '../../../domain/enums/session.enum';

export class SerializedSessionDto {
    @IsString()
    id!: string;

    @IsString()
    userId!: string;

    @IsEnum(SessionStatus)
    status!: SessionStatus;

    @IsEnum(DeviceType)
    deviceType!: DeviceType;

    @IsString()
    browser!: string;

    @IsString()
    operatingSystem!: string;

    @IsString()
    ipAddress!: string;

    @IsString()
    userAgent!: string;

    @IsISO8601()
    lastActivityAt!: string;

    @IsISO8601()
    expiresAt!: string;

    @IsOptional()
    @IsISO8601()
    revokedAt!: string | null;

    @IsISO8601()
    createdAt!: string;

    @IsISO8601()
    updatedAt!: string;
}
