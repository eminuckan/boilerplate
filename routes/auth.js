const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  imageUpload,
  forgotPassword,
  resetPassword,
  getUser,
  confirmEmail
} = require ('../controllers/auth');

const {
  getAccessToRoute
} = require('../middlewares/auth');

const profileImageUpload = require('../middlewares/profileImage');

router.post("/register", register);
router.post("/login", login);
router.get("/confirmEmail",confirmEmail);
router.get("/logout", getAccessToRoute, logout);
router.get("/profile", getAccessToRoute, getUser);
router.post("/uploadProfileImage", [getAccessToRoute, profileImageUpload.single("profile_image")], imageUpload); // profile_image front endde inputun keyi
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword",resetPassword);

module.exports = router;

