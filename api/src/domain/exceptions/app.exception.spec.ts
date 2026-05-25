import { AppException } from './app.exception';
import { NotFoundException } from './not-found.exception';
import { UnauthorizedException } from './unauthorized.exception';
import { ConflictException } from './conflict.exception';

describe('AppException hierarchy', () => {
  it('AppException stores statusCode, message and error', () => {
    const ex = new AppException(422, 'invalid input', 'Unprocessable Entity');
    expect(ex.statusCode).toBe(422);
    expect(ex.message).toBe('invalid input');
    expect(ex.error).toBe('Unprocessable Entity');
    expect(ex).toBeInstanceOf(Error);
  });

  it('NotFoundException extends AppException with 404', () => {
    const ex = new NotFoundException('Appointment', 'abc-123');
    expect(ex.statusCode).toBe(404);
    expect(ex.error).toBe('Not Found');
    expect(ex.message).toContain('Appointment');
    expect(ex).toBeInstanceOf(AppException);
  });

  it('NotFoundException without id produces readable message', () => {
    const ex = new NotFoundException('Category');
    expect(ex.message).toContain('Category');
  });

  it('UnauthorizedException extends AppException with 401', () => {
    const ex = new UnauthorizedException();
    expect(ex.statusCode).toBe(401);
    expect(ex.error).toBe('Unauthorized');
    expect(ex).toBeInstanceOf(AppException);
  });

  it('ConflictException extends AppException with 409', () => {
    const ex = new ConflictException('schedule conflict');
    expect(ex.statusCode).toBe(409);
    expect(ex.error).toBe('Conflict');
    expect(ex.message).toBe('schedule conflict');
    expect(ex).toBeInstanceOf(AppException);
  });
});
