const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { getHomeData } = require("../controllers/homecontroller");

router.get("/", protect, getHomeData);

module.exports = router;