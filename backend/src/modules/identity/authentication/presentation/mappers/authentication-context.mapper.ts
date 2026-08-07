import type { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';
import { DeviceType } from '../../domain/enums/session.enum';
import { AuthenticationContext } from '../../application/contracts/authentication-context';

export class AuthenticationContextMapper {
    formRequest(req: Request): AuthenticationContext {
        const ua = new UAParser(req.headers['user-agent']).getResult();
        const deviceType =
            ua.device.type === 'mobile'
                ? DeviceType.MOBILE
                : ua.device.type === 'tablet'
                  ? DeviceType.TABLET
                  : DeviceType.DESKTOP;
        const context = {
            deviceType,
            browser: ua.browser.name ?? 'unknown',
            operatingSystem: ua.os.name ?? 'unknown',
            ipAddress: req.ip ?? '',
            userAgent: req.headers['user-agent'] ?? '',
        };
        return context;
    }

    formResponse(res: Response, refreshToken: string) {
        return res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development' ? false : true,
            sameSite: 'strict',
            path: '/',
        });
    }
}
