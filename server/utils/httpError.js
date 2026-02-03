class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const createError = (status, message, code, details) =>
  new HttpError(status, message, code, details);

const badRequest = (message = "Bad request", details) =>
  createError(400, message, "bad_request", details);

const unauthorized = (message = "Unauthorized", details) =>
  createError(401, message, "unauthorized", details);

const forbidden = (message = "Forbidden", details) =>
  createError(403, message, "forbidden", details);

const notFound = (message = "Not found", details) =>
  createError(404, message, "not_found", details);

const conflict = (message = "Conflict", details) =>
  createError(409, message, "conflict", details);

const unprocessable = (message = "Invalid data", details) =>
  createError(422, message, "validation_error", details);

module.exports = {
  HttpError,
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
};
