const { APIError, validationError } = require("./customerrors");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        status: err.statusCode,
        message: err.message,
        detail: err.detail,
        timestamp: err.timestamp,
      },
    });
  } else if (err instanceof validationError) {
    return res.status(422).json({
      error: {
        status: 422,
        message: err.message,
        timestamp: err.timestamp,
      },
    });
  } else {
    console.error("Unhandled Error:", err);
    return res.status(500).json({
      error: {
        status: 500,
        message: "Internal Server Error",
        detail: "An unexpected error occurred on the server.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

module.exports = { errorHandler };
