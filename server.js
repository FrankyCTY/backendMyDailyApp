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
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
