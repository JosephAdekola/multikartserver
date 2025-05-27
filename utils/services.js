const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt)

    return hash;

}

const generateOtp = () => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`
    return otp;

}

const generateToken = async (id, role) => {
    const token = jwt.sign({ userId: id, isAdmin: role }, process.env.JWTSECRETE)

    return token;
}

const verifyToken = (token) => {
    const secret = process.env.JWTSECRETE;

    try {
        const parsedToken = jwt.verify(token, secret);
        return parsedToken;
    } catch (err) {
        console.error("Invalid or expired token:", err.message);
        return null;
    }
};

module.exports = {
    hashPassword,
    generateOtp,
    generateToken,
    verifyToken
}