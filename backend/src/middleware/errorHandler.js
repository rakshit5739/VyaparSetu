/**
 * Global Error Handler Middleware
 * Catches all errors passed via next(err) and returns structured JSON response.
 * In development, includes the stack trace for easier debugging.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Server Error",
  };

  // Include stack trace in non-production environments for debugging
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
