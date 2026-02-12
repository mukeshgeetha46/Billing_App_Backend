// routes/company.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadCompanyMedia");
const { addStore, getStore, getCompanyById } = require("../controllers/storecontroller");
const protect = require("../middlewares/authMiddleware");

router.post(
    "/add",
    protect,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    addStore
);

router.get("/", protect, getStore);
router.get("/:id", protect, getCompanyById);

module.exports = router;
