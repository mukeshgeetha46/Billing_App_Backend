const express = require("express");
const { signup, signin, getuser } = require("../controllers/authcontroller");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", protect, getuser);

module.exports = router;
