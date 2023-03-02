const express = require("express");
const { login } = require("../controller/user");

const router = express.Router();

router.post("/loginuser", login);

module.exports = router;