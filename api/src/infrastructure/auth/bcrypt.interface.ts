export interface IBcryptService {
  hash(plain: string, rounds?: number): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const BCRYPT_SERVICE = Symbol('IBcryptService');
