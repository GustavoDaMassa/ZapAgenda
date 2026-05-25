import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../../domain/exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolve(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
  } {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.error,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        const raw = b['message'];
        const message = Array.isArray(raw)
          ? (raw as string[]).join(', ')
          : typeof raw === 'string'
            ? raw
            : exception.message;
        const error = typeof b['error'] === 'string' ? b['error'] : HttpStatus[status];
        return { statusCode: status, message, error };
      }

      return {
        statusCode: status,
        message: typeof body === 'string' ? body : exception.message,
        error: HttpStatus[status] ?? 'Error',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
