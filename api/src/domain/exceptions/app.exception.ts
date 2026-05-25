export class AppException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly error: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
