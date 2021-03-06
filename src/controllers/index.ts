import { Response } from 'express';
import mongoose from 'mongoose';
import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/errors/api-error';

interface HandleClientErrorsResponse {
  error: string;
  code: number;
}

export abstract class BaseController {
  protected sendCreatedUpdatedErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).json(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);
      res
        .status(500)
        .json(ApiError.format({ code: 500, message: 'Something went wrong' }));
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): HandleClientErrorsResponse {
    const duplicatedKindErrors = Object.values(error.errors).filter((err) => {
      if (err instanceof mongoose.Error.ValidatorError) {
        return err.kind === CUSTOM_VALIDATION.DUPLICATED;
      }
      return null;
    });
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).json(ApiError.format(apiError));
  }
}
