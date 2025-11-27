const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const success = (res, data, status = HTTP_STATUS.OK) => res.status(status).json(data);

const error = (res, message, status = HTTP_STATUS.SERVER_ERROR) => res.status(status).json({ error: message });

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`Error: ${err.message}`);
    error(res, 'Internal server error');
  });
};

module.exports = { HTTP_STATUS, success, error, asyncHandler };

