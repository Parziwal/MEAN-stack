const express = require("express");
const router = express.Router();
const UserControlller = require('../controllers/user');

router.post("/signup", UserControlller.createUser);

router.post("/login", UserControlller.userLogin);

module.exports = router;