import { HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { Request, Response } from 'express';

import { ProblemDetailsFilter } from './problem-details.filter.js';

describe('ProblemDetailsFilter', () => {
  it('logs an internal exception while returning a safe problem response', () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const status = jest.fn().mockReturnThis();
    const type = jest.fn().mockReturnThis();
    const json = jest.fn();
    const request = { method: 'POST', url: '/api/work-orders' } as Request;
    const response = { json, status, type } as unknown as Response;
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    new ProblemDetailsFilter().catch(new Error('database detail'), host);

    expect(error).toHaveBeenCalledWith(
      'Unhandled error for POST /api/work-orders',
      expect.stringContaining('database detail'),
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'An unexpected error occurred.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
