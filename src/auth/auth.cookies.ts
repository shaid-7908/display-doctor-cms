import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Options shared by both tokens */
export const BASE_COOKIE_OPTIONS = {
    httpOnly: true,          // JS cannot read these – XSS safe
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    //sameSite: 'strict' as const
};

export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    configService: ConfigService
): void {
    const accessMaxAgeMs = parseMs(configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m');
    const refreshMaxAgeSec = Number(configService.get<number>('JWT_REFRESH_EXPIRES_IN') ?? 604800);

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        ...BASE_COOKIE_OPTIONS,
        maxAge: accessMaxAgeMs   // milliseconds for cookie maxAge
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...BASE_COOKIE_OPTIONS,
        maxAge: refreshMaxAgeSec * 1000   // convert seconds → ms
    });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
    res.clearCookie(REFRESH_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
}

/**
 * Bare-minimum duration string parser (e.g. "15m" → 900000 ms).
 * Handles: s, m, h, d suffixes.  Falls back to 15 minutes.
 */
export function parseMs(value: string): number {
    const match = /^(\d+)(s|m|h|d)?$/.exec(value.trim());
    if (!match) return 15 * 60 * 1000;
    const n = parseInt(match[1], 10);
    switch (match[2]) {
        case 's': return n * 1000;
        case 'm': return n * 60 * 1000;
        case 'h': return n * 60 * 60 * 1000;
        case 'd': return n * 24 * 60 * 60 * 1000;
        default: return n;
    }
}
