// routes/company.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadCompanyMedia");
const { addCompany, getCompany, getCompanyById, getComapnyNameById } = require("../controllers/companycontroller");
const protect = require("../middlewares/authMiddleware");

router.post(
    "/add",
    protect,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    addCompany
);

router.get("/", protect, getCompany);
router.get("/getname", protect, getComapnyNameById);
router.get("/:id", protect, getCompanyById);

module.exports = router;
