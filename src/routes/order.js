// routes/company.routes.js
const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/orderController");
const protect = require("../middlewares/authMiddleware");

router.post(
    "/add",
    protect,
    createOrder
);


module.exports = router;
