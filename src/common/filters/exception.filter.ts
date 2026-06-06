import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '@common/logger/winston.logger';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
    winston: WinstonLoggerService;
    configService: ConfigService;

    constructor() {
        this.winston = new WinstonLoggerService();
        this.configService = new ConfigService();
    }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const exceptionStatus = (exception.getStatus && exception.getStatus()) || HttpStatus.INTERNAL_SERVER_ERROR;
        console.log(exception)
        // ── Redirect browser (EJS) requests to /login on 401 ──────────────
        // A request is a "browser page" request when:
        //   • The status is 401 (Unauthorized / guard failed)
        //   • The URL does NOT start with /api (REST API prefix)
        //   • The Accept header prefers text/html (normal browser navigation)
        if (
            exceptionStatus === HttpStatus.UNAUTHORIZED &&
            !request.url?.startsWith('/api') &&
            (request.headers?.accept as string)?.includes('text/html')
        ) {
            return response.redirect('/login');
        }
        // ───────────────────────────────────────────────────────────────────

        const data: any = {
            statusCode: exceptionStatus,
            message: exception?.message || exception,
            stack: this.configService.get('NODE_ENV') == 'local' ? exception.stack : null
        };

        switch (exceptionStatus) {
            case HttpStatus.BAD_REQUEST:
                const exceptionResponse = exception.getResponse();
                if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                    const messages = Array.isArray(exceptionResponse['message']) ? exceptionResponse['message'] : [exceptionResponse['message']];
                    data.message = messages[0];
                }
                break;
            case HttpStatus.UNAUTHORIZED:
                data.message = 'Unauthorized';
                break;
            case HttpStatus.TOO_MANY_REQUESTS:
                data.message = 'Too Many Requests';
                break;
            default:
                break;
        }

        return response.status(exceptionStatus).json(data);
    }
}