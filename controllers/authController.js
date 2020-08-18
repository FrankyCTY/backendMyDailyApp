const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const withCatchErrAsync = require("../utils/error/withCatchErrAsync");
const OperationalErr = require("../utils/error/OperationalErr");

const generateToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.signUp = withCatchErrAsync(async (req, res, next) => {
  const { name, email, photo, password, passwordConfirm } = req.body;

  // 1) Create in db
  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    passwordConfirm,
    passwordChangedStamp: new Date(),
  });

  // 2) generate JWT
  const token = generateToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = withCatchErrAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new OperationalErr("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new OperationalErr(401, "Incorrect email or password"));
  }
  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.checkUserAccess = withCatchErrAsync(async (req, res, next) => {
  //NOTE: JWT VERIFICATION + EXPIRATION are handled by jwt, we have created
  // code to catch the error that throws by jwt already.

  // 1) Checking the JWT is in the request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token === null || token === undefined) {
    return next(
      new OperationalErr(
        401,
        "You are not log in, please log in to gain access."
      )
    );
  }
  // 2)
  //Check if the user account relates to this JWT still exist
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const userDoc = await User.findById(decodedPayload.id);
  console.log("userDoc", userDoc);
  if (userDoc === null) {
    return next(
      new OperationalErr(
        401,
        "You are not log in, please log in to gain access."
      )
    );
  }

  // 3) Check if the user has changed the password after issuing this JWT
  if (userDoc.isPasswordChanged(decodedPayload.iat)) {
    return next(
      new OperationalErr(
        401,
        "You are not log in, please log in to gain access."
      )
    );
  }

  // 4) save the user doc into request just to in case some request needs it
  req.user = userDoc;

  next();
});
