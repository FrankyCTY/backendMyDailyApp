const AppError = require("../utils/error/AppError");

const sendErrorDev = (error, res) => {
  return res.status(
    error.statusCode.json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    })
  );
};

const sendErrorProd = (error, res) => {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  // Programming and other errors
  // 1) log error
  console.error("ERROR: ", error);
  // 2) send response
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

const handleObjectIdErrorDB = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
};

const handleDuplicateFieldDB = (error) => {
  const fieldValue = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  return new AppError(
    `Duplicate field value: ${fieldValue}. Please use another value!`,
    400
  );
};

const handleValidationErrDB = (error) => {
  const allErrMsgs = Object.values(error.errors).map(
    (errObj) => errObj.message
  );

  const message = `Invalid input data. ${allErrMsgs.join(". ")}`;

  return new AppError(message, 400);
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let cloneErr = { ...error };
    // !) These handle database error will transform error into AppError format
    // and the "isOperational" will be set to true as default.
    if (error.kind === "ObjectId") cloneErr = handleObjectIdErrorDB(error);
    if (error.code === 11000) cloneErr = handleDuplicateFieldDB(error);
    if (error._message === "Validation failed")
      cloneErr = handleValidationErrDB(error);

    sendErrorProd(cloneErr, res);
  }
};
