const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide a name to us"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email address to us"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    lowercase: true,
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please tell us your password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please tell us your confirm password"],
    select: false,
    validate: {
      // This only works on CREATE and SAVE!!! (NOT UPDATE!!)
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: "Confirm Password must match password",
    },
  },
  passwordChangedStamp: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // 1) Hash the password with brypt using salt 12 chars
  this.password = await bcrypt.hash(this.password, 12);

  // 2) Delete password confirm field, we don't want it in the database
  this.passwordConfirm = undefined;

  return next();
});

// Instance method
userSchema.methods.checkPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.isPasswordChanged = function (tokenIssueTime) {
  const passwordChangedStamp = parseInt(
    this.passwordChangedStamp.getTime() / 1000,
    10
  );
  return passwordChangedStamp > tokenIssueTime;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
