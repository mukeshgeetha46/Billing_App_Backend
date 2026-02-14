const db = require("../config/db");

exports.getHomeData = async (req, res) => {
    try {

        const data = await db("Companies").select("*").where({ userid: req.user.id }).orderBy("id", "desc");
        const result = data.map((item) => {
            return { id: item.id, name: item.companyName, color: item.brandColor, image: item.logo ? `${process.env.BASE_URL}/uploads/company/${item.logo}` : null };
        });
        res.json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}