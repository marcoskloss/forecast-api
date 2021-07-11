/* eslint-disable @typescript-eslint/ban-types */
import AuthService from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('Auth middleware', () => {
  it('should verify a JWT and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid-token',
      },
    };
    const jsonMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        json: jsonMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return UNAUTHORIZED if there is no token', () => {
    const reqFake = {
      headers: {},
    };
    const jsonMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        json: jsonMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
