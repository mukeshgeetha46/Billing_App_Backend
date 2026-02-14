// controllers/orderController.js
const db = require("../config/db");

exports.createOrder = async (req, res) => {
    const { shopId, items } = req.body;

    try {
        await db.transaction(async (trx) => {

            let subTotal = 0;
            let gstTotal = 0;

            // To store processed item details
            const processedItems = [];

            for (const item of items) {

                const variant = await trx("ProductVariants as pv")
                    .join("Productsn as p", "p.ProductID", "pv.ProductID")
                    .select(
                        "pv.VariantID",
                        "pv.ProductID",
                        "pv.WholesalePrice",
                        "pv.Stock",
                        "p.GSTPercent",
                        "p.CompanyID"
                    )
                    .where("pv.VariantID", item.variantId)
                    .first();

                if (!variant)
                    throw new Error(`Variant ${item.variantId} not found`);

                if (variant.Stock < item.quantity)
                    throw new Error(`Insufficient stock for Variant ${item.variantId}`);

                const price = variant.WholesalePrice;
                const gst = (price * variant.GSTPercent) / 100;

                subTotal += price * item.quantity;
                gstTotal += gst * item.quantity;

                processedItems.push({
                    ProductID: variant.ProductID,
                    VariantID: variant.VariantID,
                    CompanyID: variant.CompanyID,
                    Quantity: item.quantity,
                    Price: price,
                    GSTPercent: variant.GSTPercent,
                    Total: (price + gst) * item.quantity
                });
            }

            const totalAmount = subTotal + gstTotal;

            // Insert ONE Final Order
            const [orderId] = await trx("Orders")
                .insert({
                    ShopId: shopId,
                    SubTotal: subTotal,
                    GSTAmount: gstTotal,
                    TotalAmount: totalAmount,
                })
                .returning("OrderID");

            const finalOrderId = orderId.OrderID || orderId;

            // Insert Order Items
            for (const item of processedItems) {

                await trx("OrderItems").insert({
                    OrderID: finalOrderId,
                    ProductID: item.ProductID,
                    VariantID: item.VariantID,
                    Quantity: item.Quantity,
                    Price: item.Price,
                    GSTPercent: item.GSTPercent,
                    Total: item.Total,
                    CompanyID: item.CompanyID  // important for reporting
                });

                // Reduce Stock
                await trx("ProductVariants")
                    .where("VariantID", item.VariantID)
                    .decrement("Stock", item.Quantity);
            }

        });

        res.status(200).json({
            success: true,
            message: "Final consolidated order created successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
