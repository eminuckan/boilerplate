const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email"],
  },

  password: {
    type: String,
    minlength: [6, "password length must be of 6-15"],
    maxlength: [15, "password length must be of 6-15"],
    required: [true, "Password required"],
    select: false, //burada validasyonu @hapi/joi paketiyle production sürecinden önce yaparız regexle
  },

  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  title: {
    type: String,
  },

  about: {
    type: String,
  },

  place: {
    type: String,
  },

  profile_image: {
    type: String,
    default: "default.jpg",
  },

  blocked: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  confirmEmailToken: {
    type: String,
  },

  confirmEmailExpire: {
    type: Date,
  },

  resetPasswordToken: {
    type: String,
  },

  resetPasswordExpire: {
    type: Date,
  },
});

UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");
  const { RESET_PASSWORD_EXPIRE } = process.env;
  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);

  return resetPasswordToken;
};

UserSchema.methods.emailConfirmToken = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");
  const { EMAIL_CONFIRM_EXPIRE } = process.env;
  const confirmEmailToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.confirmEmailToken = confirmEmailToken;
  this.confirmEmailExpire = Date.now() + parseInt(EMAIL_CONFIRM_EXPIRE);
  return confirmEmailToken;
};

UserSchema.methods.generateJWTFromUser = function () {
  const { JWT_SECRET, JWT_EXPIRE } = process.env;
  const payload = {
    id: this._id,
    name: this.name,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

UserSchema.pre("save", function (next) {
  //Parola değişmemişse
  if (!this.isModified("password")) next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", UserSchema);
