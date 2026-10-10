const notFound = (req, res, next) =>
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { status: 404 }));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let errors;

  if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    message = Object.values(errors)[0];
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'An account with this email already exists';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }
  res.status(status).json({ message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };
