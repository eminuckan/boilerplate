const express = require("express");
const auth = require("./auth");
const router = express.Router();

// /api
router.use("/auth", auth);

module.exports = router;
