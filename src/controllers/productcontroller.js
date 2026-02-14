const db = require("../config/db");

exports.createProduct = async (req, res) => {
    try {
        const {
            ProductName,
            ProductTitle,
            ProductDescription,
            GSTPercent,
            IsActive,
            CompanyID,
        } = req.body;

        // Uploaded images
        const images = req.files.ProductImages?.map(file => file.filename) || [];

        // 👉 Example DB object
        const productData = {
            ProductName,
            ProductTitle,
            ProductDescription,
            GSTPercent,
            IsActive,
            CompanyID,
            CategoryID: 1,
            CreatedAt: new Date(),
        };

        // 🔽 Save to DB (example – adjust for your DB)
        await db("Productsn").insert(productData);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: productData,
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};

exports.AddProductVariant = async (req, res) => {
    try {

        const { ProductID, Color, Size, Unit, Quantity, WholesalePrice, MRP, Stock } = req.body;
        await db("ProductVariants").insert({
            ProductID,
            Color,
            Size,
            Unit,
            Quantity,
            WholesalePrice,
            MRP,
            Stock,
        })
        return res.status(201).json({
            success: true,
            message: "Product variant added successfully",
            data: {
                ProductID,
                Color,
                Size,
                Unit,
                Quantity,
                WholesalePrice,
                MRP,
                Stock,
            },
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to add product variant",
        });
    }
}

exports.AddProductVariantImg = async (req, res) => {
    try {
        const { VariantID } = req.body;
        const images = req.files.images;
        const Primary = JSON.parse(req.body.isPrimary)

        images.map(async (img, index) => {

            await db("VariantImages").insert({
                VariantID: VariantID,
                ImageUrl: img.filename,
                IsPrimary: Primary[index],
            })
        })
        return res.status(201).json({
            success: true,
            message: "Product variant image added successfully",
            data: {
                VariantID,
                ImageUrl: images.map((img) => img.filename),

            },
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Failed to add product variant image",
        });
    }
}

exports.getProduct = async (req, res) => {
    try {
        const products = await db("Productsn").select("*").orderBy("ProductID", "desc");

        const data = await Promise.all(
            products.map(async (product) => {
                // Fetch variants
                const variants = await db("ProductVariants")
                    .select("VariantID", "Stock", "MRP", "Color")
                    .where({ ProductID: product.ProductID });

                // Total stock
                const totalStock = variants.reduce(
                    (sum, v) => sum + (v.Stock || 0),
                    0
                );
                const initialVariant = variants[0] || null;
                // Default image
                let image = null;

                if (variants.length > 0) {
                    const primaryImage = await db("VariantImages")
                        .select("ImageUrl")
                        .where({
                            VariantID: initialVariant.VariantID,
                            IsPrimary: 1,
                        })
                        .first();
                    image = primaryImage?.ImageUrl ? `${process.env.BASE_URL}/uploads/company/${primaryImage?.ImageUrl}` : null;
                }

                return {
                    id: product.ProductID,
                    name: product.ProductTitle,
                    description: product.ProductDescription,
                    sku: product.ProductName,
                    stock: `${totalStock} units`,
                    image,
                    inStock: totalStock > 0,
                    stockcount: totalStock,
                    color: initialVariant?.Color || "",
                    VariantID: initialVariant?.VariantID || "",
                };
            })
        );




        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};
const COLOR_MAP = {
    // Basics
    black: "#000000",
    white: "#FFFFFF",
    gray: "#808080",
    lightgray: "#D3D3D3",
    darkgray: "#404040",

    // Reds & Pinks
    red: "#FF0000",
    darkred: "#8B0000",
    crimson: "#DC143C",
    maroon: "#800000",
    rose: "#FF007F",
    hotpink: "#FF69B4",
    salmon: "#FA8072",
    coral: "#FF7F50",

    // Oranges & Yellows
    orange: "#FFA500",
    darkorange: "#FF8C00",
    amber: "#FFBF00",
    gold: "#D4AF37",
    yellow: "#FFD700",
    mustard: "#FFDB58",

    // Greens
    green: "#008000",
    darkgreen: "#006400",
    olive: "#808000",
    lime: "#00FF00",
    mint: "#98FF98",
    seagreen: "#2E8B57",
    emerald: "#50C878",
    teal: "#008080",

    // Blues
    blue: "#0000FF",
    navy: "#000080",
    royalblue: "#4169E1",
    skyblue: "#87CEEB",
    steelblue: "#4682B4",
    cyan: "#00FFFF",
    turquoise: "#40E0D0",

    // Purples
    purple: "#800080",
    indigo: "#4B0082",
    violet: "#8A2BE2",
    plum: "#DDA0DD",
    lavender: "#E6E6FA",

    // Browns & Neutrals
    brown: "#8B4513",
    chocolate: "#7B3F00",
    sienna: "#A0522D",
    tan: "#D2B48C",
    beige: "#F5F5DC",
    khaki: "#C3B091",

    // Metallics
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    copper: "#B87333",

    // Dark / Special
    charcoal: "#36454F",
    midnightblue: "#191970",
    slate: "#708090"
};


exports.getProductById = async (req, res) => {
    try {

        const { id, color, VariantID } = req.body;
        let query = `
            SELECT TOP 1
                p.ProductID,
                p.ProductName,
                p.ProductTitle,
                v.WholesalePrice,
                v.MRP,
                v.Stock,
                v.Color,
                v.Quantity,
                v.Unit,
                p.ProductDescription,
                v.Size,
                v.VariantID
            FROM Productsn p
            LEFT JOIN ProductVariants v 
                ON p.ProductID = v.ProductID
            WHERE p.ProductID = ?
        `;

        let params = [id];

        // 👇 Only add color condition if color exists
        if (color) {
            query += ` AND v.Color = ?`;
            params.push(color);
        }

        const result = await db.raw(query, params);
        const item = result[0];

        if (!item) {
            return res.status(404).json({ message: "Product not found" });
        }

        const images = await db("VariantImages")
            .where({ VariantID: item.VariantID })
            .select("ImageUrl");

        const colors = await db("ProductVariants")
            .where({ ProductID: item.ProductID })
            .select("Color", "VariantID");

        const sizes = await db("ProductVariants")
            .where({ ProductID: item.ProductID, Color: color })
            .select("Size");
        console.log('sizes', sizes)
        const formattedImages = images.map(
            img => `${process.env.BASE_URL}/uploads/company/${img.ImageUrl}`
        );
        const newcolor = colors.map((c) => {
            const key = c.Color.trim().toLowerCase(); // 👈 handles CAPS, spaces

            return {
                id: c.VariantID,
                name: c.Color,
                color: COLOR_MAP[key] || "#CCCCCC", // fallback
            };
        });
        const uniqueColors = Array.from(
            new Map(newcolor.map(item => [item.name.trim().toLowerCase(), item])).values()
        );



        const data = {
            id: item.ProductID,
            VariantID: item.VariantID,
            name: item.ProductTitle,
            brand: "Hireware",
            price: item.MRP,
            msrp: item.WholesalePrice,
            minOrder: item.Quantity,
            unitsPerCase: item.Unit,
            description: item.ProductDescription,
            colors: uniqueColors,
            sizes: sizes.length > 1 ? sizes.map((c) => c.Size) : [],
            specs: {
                Material: "Full Grain Leather",
                SKU: "HG-TOTE-SADL",
                Dimensions: '16" x 12" x 5"',
                Weight: `${item.Quantity} ${item.Unit}`,
                Size: item.Size,
                Color: item.Color,
            },
            images: formattedImages,
        };
        console.log(data)
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



const isToday = (date) => {
    const today = new Date();
    const createdDate = new Date(date);

    return (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
    );
};


exports.getProductByCompanyId = async (req, res) => {
    try {
        const products = await db("Productsn")
            .where({ CompanyID: req.params.id });

        const data = await Promise.all(
            products.map(async (product) => {

                const variants = await db("ProductVariants")
                    .select("VariantID", "Stock", "MRP", "Unit", "Quantity", "Color")
                    .where({ ProductID: product.ProductID });

                const inicialProduct = variants[0] || {};

                let image = null;

                if (variants.length > 0) {
                    const primaryImage = await db("VariantImages")
                        .select("ImageUrl")
                        .where({
                            VariantID: inicialProduct.VariantID,
                            IsPrimary: 1,
                        })
                        .first();

                    image = primaryImage?.ImageUrl
                        ? `${process.env.BASE_URL}/uploads/company/${primaryImage.ImageUrl}`
                        : null;
                }

                return {
                    id: product.ProductID,
                    companyId: product.CompanyID,
                    name: product.ProductTitle,
                    price: inicialProduct.MRP || null,
                    color: inicialProduct.Color || null,
                    unit: inicialProduct.Unit || null,
                    minOrder: inicialProduct.Quantity || null,
                    image,
                    tag: isToday(product.CreatedAt) ? 'NEW' : '',
                    tagColor: isToday(product.CreatedAt) ? '#2563EB' : '',
                };
            })
        );

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};


exports.CheckIfVariantsExists = async (req, res) => {
    try {
        const { ProductID } = req.params;

        const variants = await db("ProductVariants")
            .select("VariantID", "Color", "Size")
            .where({ ProductID });
        console.log(variants[0])
        const variantsdata = variants[0] || null;
        // Filter variants where both Color and Size exist
        const validVariants = variants.filter(v =>
            v.Color || v.Color.trim() !== "" &&
            v.Size || v.Size.trim() !== ""
        );

        if (validVariants.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Product variants already exists",
                color: validVariants.map((c) => ({
                    id: c.VariantID,
                    color: c.Color,
                    size: c.Size,
                })),
            });
        }

        return res.status(200).json({
            success: false,
            message: "Product variants not exists",
            color: [],
            VariantID: variantsdata.VariantID
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to check product variants",
        });
    }
}

exports.getVariantsSize = async (req, res) => {
    try {
        const { ProductID } = req.params;

        const variants = await db("ProductVariants").where({ ProductID });
        if (variants.length > 0) {

            return res.status(200).json({
                success: true,
                message: "Product variants already exists",
                size: variants.map((c) => {
                    return {
                        id: c.VariantID,
                        size: c.Size,
                        color: c.Color,
                    }
                }),
            });
        }
        return res.status(200).json({
            success: false,
            message: "Product variants not exists",
            data: [],
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to check product variants",
        });
    }
}