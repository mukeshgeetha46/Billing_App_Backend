const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await db("Users").where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userId] = await db("Users")
            .insert({
                name,
                email,
                password: hashedPassword,
            })
            .returning("id");

        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(userId.id || userId),
            user: {
                id: userId.id,
                name: userId.name,
                email: userId.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SIGNIN
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db("Users").where({ email }).first();
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getuser = async (req, res) => {
    try {
        const user = await db("Users").where({ id: req.user.id }).first();
        delete user.password;
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}