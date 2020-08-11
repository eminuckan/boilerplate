const User = require("../models/User");
const CustomError = require("../helpers/CustomErrors");
const errorWrapper = require("express-async-handler");
const { sendJWTToClient } = require("../helpers/tokenHelpers");
const {
  validateUserInput,
  comparePasswords,
} = require("../helpers/inputHelpers");
const sendEmailConfirm = require("../helpers/sendEmailConfirm");

const {sendEmail} = require("../helpers/mailHelper");
const {passwordResetTemplate} = require('../helpers/mailTemplates');

const register = errorWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  const confirmEmailToken = user.emailConfirmToken();
  sendEmailConfirm(user, confirmEmailToken);
  sendJWTToClient(user, res);
});

const confirmEmail = errorWrapper(async (req, res, next) => {
  const { emailConfirmToken } = req.query;

  if (!emailConfirmToken) {
    next(new CustomError("Invalid Token", 400));
  }

  let user = await User.findOne({
    confirmEmailToken: emailConfirmToken,
  });

  if (!user) {
    return next(new CustomError("Invalid Token or Session Expired", 404));
  }

  user.isVerified = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Your account successfuly verified.",
  });
});

const login = errorWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }

  const user = await User.findOne({
    email,
  }).select("+password");
  if (!user) return next(new CustomError("User not found", 400));
  if (!comparePasswords(password, user.password)) {
    return next(new CustomError("Passwords dont match", 400));
  }

  sendJWTToClient(user, res);
});

const getUser = (req, res, next) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
    },
  });
};

const logout = errorWrapper(async (req, res, next) => {
  const { JWT_COOKIE_EXPIRE, NODE_ENV } = process.env;

  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout successfull",
    });
});

const imageUpload = errorWrapper(async (req, res, next) => {
  // Image gelmiş oluyor sadece veritabanına file name ekliyoruz burada
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profile_image: req.savedImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "image upload successfull",
    data: user,
  });
});

const forgotPassword = errorWrapper(async (req, res, next) => {
  const resetEmail = req.body.email;

  const user = await User.findOne({
    email: resetEmail,
  });


  if (!user) {
    return next(new CustomError("User not found", 400));
  }

  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = passwordResetTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Reset Your Password",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Token sent to your email",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log(err);
    return next(new CustomError("Email Could Not Be Sent", 500));
  }
});

const resetPassword = errorWrapper(async (req, res, next) => {
  const { resetPasswordToken } = req.query;

  const { password } = req.body;

  if (!resetPasswordToken) {
    return next(new CustomError("Incorrect Reset Token", 400));
  }

  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, //gt = greater than mongodb özelliği
  });

  if (!user) {
    return next(new CustomError("Invalid Token or Session Expired", 404));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Your Password Has Been Succesfuly Updated",
  });
});

module.exports = {
  register,
  confirmEmail,
  login,
  getUser,
  logout,
  imageUpload,
  forgotPassword,
  resetPassword,
};
