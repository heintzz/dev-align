const express = require("express");
const { getMenu } = require("../controllers/menu.controller");
const verifyToken = require("../middlewares/token");
const router = express.Router();

router.get("/getMenu", getMenu);

module.exports = router;
