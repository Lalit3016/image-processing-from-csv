import { Response } from 'express';
import logger from './logger';
import { buildResponse } from './utils';

export class ForbiddenError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class ValidationFailedError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'ValidationFailedError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

export class NoContentError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'NotContentError';
  }
}

export const errorHandler = (res: Response, error: Error) => {
  logger.error(error);
  if (error instanceof ValidationFailedError) {
    return res.status(400).send(buildResponse(false, '', String(error.message), String(error)));
  } else if (error instanceof ResourceNotFoundError) {
    return res.status(404).send(buildResponse(false, '', String(error.message), String(error)));
  } else if (error instanceof ForbiddenError) {
    return res.status(403).send(buildResponse(false, '', String(error.message), String(error)));
  }
  return res.status(500).send(buildResponse(false, '', 'Server Error', String(error)));
};
