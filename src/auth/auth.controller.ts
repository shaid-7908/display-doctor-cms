import {
    Body, Controller, HttpCode, Post,
    Req, Res, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshJwtDto, LogoutDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ForgotPasswordDTO, ResetPasswordDTO, UserSignInDTO, UserSignupDTO } from '@modules/users/dto/user.dto';
import { SingleFileInterceptor } from '@common/interceptors/files.interceptor';
import { Request, Response } from 'express';
import { LoginUser } from '@common/decorator/login-user.decorator';
import { ConfigService } from '@nestjs/config';
//import { ApiGroup } from '@common/decorator/api-group.decorator';

// ─── cookie helpers ──────────────────────────────────────────────────────────

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Options shared by both tokens */
const BASE_COOKIE_OPTIONS = {
    httpOnly: true,          // JS cannot read these – XSS safe
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict' as const
};

function setAuthCookies(
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

function clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
    res.clearCookie(REFRESH_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
}

/**
 * Bare-minimum duration string parser (e.g. "15m" → 900000 ms).
 * Handles: s, m, h, d suffixes.  Falls back to 15 minutes.
 */
function parseMs(value: string): number {
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

// ─── controller ──────────────────────────────────────────────────────────────

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }


    @Post('login')
    @HttpCode(200)
    @UseGuards(ThrottlerGuard)
    async login(
        @Body() dto: UserSignInDTO,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.userLogin(dto, req);
        const { accessToken, refreshToken } = result.data as { accessToken: string; refreshToken: string };
        setAuthCookies(res, accessToken, refreshToken, this.configService);
        return result;
    }

    @Post('register')
    @UseGuards(ThrottlerGuard)
    @UseInterceptors(SingleFileInterceptor('users', 'profileImage'))
    @ApiConsumes('application/json', 'multipart/form-data')
    async signup(
        @Body() dto: UserSignupDTO,
        @UploadedFiles() files: Express.Multer.File[],
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.userSignup(dto, files);
        const { accessToken, refreshToken } = result.data as { accessToken: string; refreshToken: string };
        setAuthCookies(res, accessToken, refreshToken, this.configService);
        return result;
    }

    @Post('forgot-password')
    @HttpCode(200)
    @UseGuards(ThrottlerGuard)
    async forgotPassword(@Body() dto: ForgotPasswordDTO) {
        return this.authService.forgotPassword(dto);
    }


    @Post('reset-password')
    @HttpCode(200)
    @UseGuards(ThrottlerGuard)
    async resetPassword(@Body() dto: ResetPasswordDTO) {
        return this.authService.resetPassword(dto);
    }


    @Post('refresh-token')
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async refreshToken(
        @Body() dto: RefreshJwtDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        // Prefer cookie over body so the EJS frontend never needs to read the token
        const refreshToken = (req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ?? dto.refreshToken;
        const result = await this.authService.refreshToken({ refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data as { accessToken: string; refreshToken: string };
        setAuthCookies(res, newAccessToken, newRefreshToken, this.configService);
        return result;
    }

    @Post('logout')
    @HttpCode(200)
    async logout(
        @Body() dto: LogoutDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = (req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ?? dto.refreshToken;
        if (refreshToken) {
            // Best-effort: no error if token not found or already revoked
            await this.authService.logout(refreshToken).catch(() => null);
        }
        clearAuthCookies(res);
        return { message: 'Logout successful' };
    }

    @Post('logout-all')
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async logoutFromAllDevices(
        @LoginUser('id') userId: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.logoutFromAllDevices(userId);
        clearAuthCookies(res);
        return result;
    }

}