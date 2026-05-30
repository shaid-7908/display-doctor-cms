import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { UserRepository } from '@modules/users/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/refresh-token/repository/refresh-token.repository';
import { JwtPayloadType } from '@common/types/jwt.type';
import { AuthService } from '../auth.service';
import { setAuthCookies, clearAuthCookies } from '../auth.cookies';

/**
 * Extracts JWT from the `access_token` httpOnly cookie.
 * Falls back to the Authorization Bearer header so API/Swagger clients keep working.
 */
function cookieOrBearerExtractor(req: Request): string | null {
    const cookieToken: string | undefined = req?.cookies?.access_token;
    if (cookieToken) return cookieToken;
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly authService: AuthService,
        readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {
        super({
            jwtFromRequest: cookieOrBearerExtractor,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            passReqToCallback: true
        });
    }

    override async authenticate(req: any, options?: any) {
        const accessToken = cookieOrBearerExtractor(req);
        let isExpired = false;
        let isDbValid = false;

        if (accessToken) {
            try {
                const decoded = this.jwtService.decode(accessToken) as JwtPayloadType;
                isExpired = decoded?.exp ? Date.now() >= decoded.exp * 1000 : true;
                isDbValid = decoded?.tokenId ? await this.refreshTokenRepository.isAccessTokenValid(decoded.tokenId) : false;
            } catch {
                isExpired = true;
                isDbValid = false;
            }
        }

        // console.log('[JwtStrategy] Authenticate Hook:', {
        //     hasAccessToken: !!accessToken,
        //     isExpired,
        //     isDbValid,
        //     hasCookies: !!req?.cookies,
        //     hasRes: !!req?.res
        // });

        if (!accessToken || isExpired || !isDbValid) {
            console.log('[JwtStrategy] Access token is missing, expired, or database-invalid. Checking refresh token...');
            const refreshToken = req?.cookies?.refresh_token;
            if (refreshToken) {
                try {
                    //console.log('[JwtStrategy] Found refresh token. Attempting silent token rotation...');
                    const result = await this.authService.refreshToken({ refreshToken });
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data as { accessToken: string; refreshToken: string };

                    //console.log('[JwtStrategy] Token rotation succeeded. Setting cookies.');
                    if (req.res) {
                        setAuthCookies(req.res, newAccessToken, newRefreshToken, this.configService);
                    }

                    if (!req.cookies) {
                        req.cookies = {};
                    }
                    req.cookies.access_token = newAccessToken;
                    //console.log('[JwtStrategy] Injected new access token into req.cookies.access_token.');
                } catch (error) {
                    console.error('[JwtStrategy] Silent refresh failed:', error);
                    if (req.res) {
                        clearAuthCookies(req.res);
                    }
                }
            } else {
                console.log('[JwtStrategy] No refresh token found. Clearing cookies.');
                if (req.res) {
                    clearAuthCookies(req.res);
                }
            }
        }

        return super.authenticate(req, options);
    }

    async validate(_req: Request, payload: JwtPayloadType, done: VerifiedCallback) {
        const { id, tokenId } = payload;

        //console.log('[JwtStrategy] Validate Hook called for user:', id);

        // Check if access token is still valid (not revoked)
        if (tokenId && !(await this.refreshTokenRepository.isAccessTokenValid(tokenId))) {
            return done(new UnauthorizedException('Token has been revoked'), false);
        }

        const user = await this.userRepository.getUserDetailsJwtAuth(id);
        if (!user) return done(new UnauthorizedException(), false);

        return done(null, user, payload.iat);
    }
}
