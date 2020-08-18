// 3) In case any exceptions are not handled: E.g. Undefined variable
process.on("uncaughtException", (error) => {
  console.error(error);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  // no server closing since this kind of error are not express errors
  process.exit(1);
});

// For Environment Variable
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// For Database setup
const mongoose = require("mongoose");
// For express
const app = require("./app");

// 1) MongoDB setup
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection successful!");
  });

// 2) Start server
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// 3) In case any errors are not handled
process.on("unhandledRejection", (error) => {
  console.error(error);
  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
