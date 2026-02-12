// controllers/company.controller.js
const db = require("../config/db");

exports.addCompany = async (req, res) => {
    try {
        const {
            companyName,
            website,
            category,
            companyType,
            brandBio,
            contactEmail,
            phoneNumber,
            streetAddress,
            city,
            state,
            country,
            pincode,
            gstNumber,
            panNumber,
            cinNumber,
            incorporationDate,
            brandColor,
            socialFacebook,
            socialInstagram,
            socialLinkedin,
            socialTwitter,
        } = req.body;

        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: "Company name is required",
            });
        }

        const logo = req.files?.logo?.[0]?.filename || null;
        const banner = req.files?.banner?.[0]?.filename || null;

        const [company] = await db("Companies")
            .insert({
                companyName,
                website,
                category,
                companyType,
                brandBio,
                contactEmail,
                phoneNumber,
                streetAddress,
                city,
                state,
                country,
                pincode,
                gstNumber,
                panNumber,
                cinNumber,
                incorporationDate,
                logo,
                banner,
                brandColor,
                socialFacebook,
                socialInstagram,
                socialLinkedin,
                socialTwitter,
                userid: req.user.id,
            })
            .returning("*"); // MSSQL supported

        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            data: company,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCompany = async (req, res) => {
    try {
        const company = await db("Companies").where({ userid: req.user.id }).orderBy("id", "desc");

        const data = company.map((item) => {
            return {
                id: item.id,
                name: item.companyName,
                category: item.category,
                products: 0,
                image: item.logo ? `${process.env.BASE_URL}/uploads/company/${item.logo}` : null,
            };
        });
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}


exports.getCompanyById = async (req, res) => {
    try {

        const company = await db("Companies").where({ id: req.params.id });
        const data = company.map((item) => {
            return {
                // General Info
                name: item.companyName,
                website: item.website,
                category: item.category,
                companyType: item.companyType,
                brandBio: item.brandBio,

                // Media
                logo: item.logo ? `${process.env.BASE_URL}/uploads/company/${item.logo}` : null,
                banner: item.banner ? `${process.env.BASE_URL}/uploads/company/${item.banner}` : null,
                brandColor: item.brandColor,

                // Contact Details
                email: item.contactEmail,
                phone: item.phoneNumber,
                address: {
                    street: item.streetAddress,
                    city: item.city,
                    state: item.state,
                    country: item.country,
                    pincode: item.pincode
                },

                // Legal & Business Info
                gstNumber: item.gstNumber,
                panNumber: item.panNumber,
                cinNumber: item.cinNumber,
                incorporationDate: item.incorporationDate,

                // Social Media
                socials: {
                    facebook: item.socialFacebook,
                    instagram: item.socialInstagram,
                    linkedin: item.socialLinkedin,
                    twitter: item.socialTwitter
                },

                stats: {
                    products: '1,240',
                    orders: '4,892',
                },
            };
        });
        res.json(data[0]);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

exports.getComapnyNameById = async (req, res) => {
    try {
        console.log(`SELECT * FROM Companies WHERE userid = ${req.user.id}`)

        const company = await db("Companies").where({ userid: req.user.id });
        const data = company.map((item) => {
            return {
                CompanyName: item.companyName,
                CompanyID: item.id,
            };
        });
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}