import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainValidationError } from '../../work-orders/domain/work-order.js';

interface ProblemDetails {
  detail: string;
  instance: string;
  status: number;
  title: string;
  type: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status =
      exception instanceof DomainValidationError
        ? HttpStatus.UNPROCESSABLE_ENTITY
        : exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const problem: ProblemDetails = {
      detail: this.getDetail(exception, status),
      instance: request.url,
      status,
      title: this.getTitle(status),
      type: `https://httpstatuses.com/${status}`,
    };

    response.status(status).type('application/problem+json').json(problem);
  }

  private getDetail(exception: unknown, status: number): string {
    if (exception instanceof DomainValidationError) return exception.message;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (typeof response === 'object' && response && 'message' in response) {
        const message = response.message;
        return Array.isArray(message) ? message.join('; ') : String(message);
      }
    }
    return status === 500 ? 'An unexpected error occurred.' : 'The request could not be processed.';
  }

  private getTitle(status: number): string {
    if (status === 400) return 'Invalid request';
    if (status === 422) return 'Domain rule violation';
    return status === 500 ? 'Internal server error' : 'Request failed';
  }
}
