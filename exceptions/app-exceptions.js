import {
  HTTP_BADREQUEST,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_UNAUTHORIZED,
  HTTP_UNPROCESSABLE_ENTITY,
} from "../config/HttpCodes.js";

class BaseError extends Error {
  constructor(name, statusCode, description) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

// 500 Internal Error
class APIError extends BaseError {
  constructor(description = "api error") {
    super("api internal server error", HTTP_INTERNAL_SERVER_ERROR, description);
  }
}

// 400 BadRequest Error
class BadRequestError extends BaseError {
  constructor(description = "bad request") {
    super("bad request", HTTP_BADREQUEST, description);
  }
}

// 401 Authorize error
class AuthorizeError extends BaseError {
  constructor(description = "Unauthorized") {
    super("unauthorized", HTTP_UNAUTHORIZED, description);
  }
}

// 404 Not Found
class ForbiddenError extends BaseError {
  constructor(description = "Forbidden") {
    super("Forbidden", HTTP_FORBIDDEN, description);
  }
}

// 404 Not Found
class NotFoundError extends BaseError {
  constructor(description = "not found") {
    super("not found", HTTP_NOT_FOUND, description);
  }
}

// 422 Validation Error
class ValidationError extends BaseError {
  constructor(errors) {
    super("Unprocessable entity", HTTP_UNPROCESSABLE_ENTITY, errors);
  }
}

export {
  APIError,
  ValidationError,
  AuthorizeError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
};
