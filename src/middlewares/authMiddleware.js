const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await db("Users")
                .where({ id: decoded.id })
                .select("id", "name", "email")
                .first();

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token invalid" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
};

module.exports = protect;
