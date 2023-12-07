class APIError extends Error {
  constructor(message, statusCode, detail) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
    this.timestamp = new Date().toISOString();
  }
}

class validationError extends Error {
  constructor(message) {
    super(message);
    this.timestamp = new Date().toISOString();
  }
}

module.exports = { APIError, validationError };
