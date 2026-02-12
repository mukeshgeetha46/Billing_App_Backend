const db = require("../config/db");

exports.addStore = async (req, res) => {
    try {
        const {
            shopName,
            ownerName,
            mobileNo,
            alternateMobileNo,
            email,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            country,
            gstNo,
            panNo,
            shopType,
        } = req.body;

        if (!shopName || !mobileNo) {
            return res.status(400).json({ message: "Shop name & mobile required" });
        }

        /* Image path (relative) */
        const logo = req.files?.logo?.[0]?.filename || null;

        await db("shops").insert({
            ShopName: shopName,
            OwnerName: ownerName,
            MobileNo: mobileNo,
            AlternateMobileNo: alternateMobileNo,
            Email: email,
            AddressLine1: addressLine1,
            AddressLine2: addressLine2,
            City: city,
            State: state,
            Pincode: pincode,
            Country: country,
            GstNo: gstNo,
            PanNo: panNo,
            ShopType: shopType,
            ShopLogo: logo,
            IsActive: 1,
        });

        res.status(201).json({
            message: "Shop created successfully",
            logo,
        });
    } catch (error) {
        console.error("Create shop error:", error);
        res.status(500).json({ message: "Server error" });
    }
}


exports.getStore = async (req, res) => {
    try {
        const store = await db("shops").select("*").where({ IsActive: 1 }).orderBy("ShopId", "desc");
        const data = store.map((item) => {
            return {
                id: item.ShopId,
                name: item.ShopName,
                owner: item.OwnerName,
                phone: item.MobileNo,
                address: `${item.AddressLine1 || ""}, ${item.City || ""}, ${item.State || ""}, ${item.Pincode || ""}`,
                image: item.ShopLogo ? `${process.env.BASE_URL}/uploads/company/${item.ShopLogo}` : null,
            };
        });
        res.status(200).json(data);
    } catch (error) {
        console.error("Get store error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getCompanyById = async (req, res) => {
    try {
        console.log(req.params.id)
        const company = await db("shops").where({ ShopId: req.params.id });
        const data = company.map((item) => {
            return {
                name: item.ShopName,
                type: item.ShopType,
                image: item.ShopLogo ? `${process.env.BASE_URL}/uploads/company/${item.ShopLogo}` : null,
                totalPurchases: '$24,580.00',
                ordersCount: 142,
                storeId: `STR-${item.ShopId}`,
                regDate: new Date(item.CreatedAt).toISOString().split('T')[0],
                paymentTerms: item.GstNo,
                creditLimit: item.PanNo,
                address: {
                    street: item.AddressLine1,
                    floor: `${item.City}, ${item.State}`,
                    city: `${item.Pincode}, ${item.Country}`,
                },
                owner: {
                    name: item.OwnerName,
                    initials: item.OwnerName
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase(),
                    phone: item.MobileNo,
                },

                recentActivity: {
                    orderNumber: '#WH-9821',
                    date: 'Oct 24, 2023',
                    items: 12,
                    amount: '$1,240.00',
                    status: 'DELIVERED',
                },
            };
        });
        console.log(data[0])
        res.json(data[0]);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}