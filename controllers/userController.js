const User = require("../models/userModel");
const withCatchErrAsync = require("../utils/error/withCatchErrAsync");
const QueryStringHandler = require("../utils/QueryStringHandler");

exports.getAllUsers = withCatchErrAsync(async (req, res, next) => {
  const queryStringClass = new QueryStringHandler(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await User.find(queryStringClass.query);

  return res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
