// routes/company.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadCompanyMedia");
const { createProduct, getProduct, getProductById, getProductByCompanyId, AddProductVariant, AddProductVariantImg, CheckIfVariantsExists, getVariantsSize } = require("../controllers/productcontroller");
const protect = require("../middlewares/authMiddleware");

router.post(
    "/add",
    protect,
    upload.fields([
        { name: "ProductImages", maxCount: 5 },
    ]),
    createProduct
);

router.get("/", protect, getProduct);
router.post("/id", protect, getProductById);
router.get("/company/detail/:id", protect, getProductByCompanyId);
router.post("/add-variant", protect, AddProductVariant);
router.post("/add-variant-image", protect, upload.fields([
    { name: "images", maxCount: 5 },
]), AddProductVariantImg);
router.get("/productvariant/check-variants/:ProductID", protect, CheckIfVariantsExists);
router.get("/productvariant/get-variants-size/:ProductID", protect, getVariantsSize);


module.exports = router;
