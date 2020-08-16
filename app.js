const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routers/tourRouter");
const AppError = require("./utils/error/AppError");
const globalErrController = require("./controllers/globalErrController");

const app = express();

// 1) General Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v2/tours", tourRouter);

app.all("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrController);

module.exports = app;
