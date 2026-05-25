import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { AppException } from '../../domain/exceptions/app.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';

const mockResponse = () => {
  const res: Record<string, jest.Mock> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (url = '/test') => ({ url });

const mockHost = (res: object, req: object): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => req,
    }),
  }) as unknown as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('maps AppException to its statusCode', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest());
    filter.catch(new AppException(422, 'invalid', 'Unprocessable Entity'), host);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 422, message: 'invalid' }),
    );
  });

  it('maps NotFoundException to 404', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest());
    filter.catch(new NotFoundException('Appointment', 'id-1'), host);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps NestJS HttpException to its status', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest());
    filter.catch(new HttpException('forbidden', HttpStatus.FORBIDDEN), host);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('maps validation HttpException array message to joined string', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest());
    filter.catch(
      new HttpException(
        { statusCode: 400, message: ['field is required', 'field must be string'], error: 'Bad Request' },
        400,
      ),
      host,
    );

    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('field is required, field must be string');
  });

  it('maps unknown error to 500', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest());
    filter.catch(new Error('boom'), host);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('response body always includes timestamp and path', () => {
    const res = mockResponse();
    const host = mockHost(res, mockRequest('/appointments'));
    filter.catch(new NotFoundException('X'), host);

    const body = res.json.mock.calls[0][0];
    expect(body.path).toBe('/appointments');
    expect(body.timestamp).toBeDefined();
  });
});
