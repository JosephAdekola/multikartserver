const express = require("express")
const { usersModel } = require("../schemas/usersSchema");
const { sendOtp } = require("../utils/email");
const { generateOtp, hashPassword, generateToken, verifyToken } = require("../utils/services");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt")

const addUser = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        address,
        city,
        state,
        postalCode,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "name fields, email and password fields are required" })
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await usersModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists, please proceed to sign in." });
        }

        const hashedPassword = await hashPassword(password);

        const newOtp = generateOtp();
        console.log(newOtp);

        const userId = uuidv4();

        const newUser = new usersModel({
            userId,
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            country,
            address,
            city,
            state,
            otp: newOtp,
            postalCode,
        });

        const savedUser = await newUser.save();
        console.log("User created:", savedUser);

        await sendOtp(normalizedEmail, newOtp);

        return res.status(201).json({
            message: "Account created, please check your email for the OTP to continue."
        });

    } catch (error) {
        console.error("Registration Error:", error.message);
        return res.status(500).json({
            error: "Unable to create user. Please try again later."
        });
    }
};


const verifyOtp = async (req, res) => {

    const { email, otp } = req.body

    try {
        const user = await usersModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(400).json({ message: "Account does not exist, pls sign up" })
        }

        if (user.otp != otp) {
            return res.status(400).json({ message: 'incorrect OTP. pls, check and try again or request for new OTP' })
        }

        await usersModel.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: { verified: true, otp: '' } }
        )

        return res.status(200).json({ message: 'Account verified, please proceed to login' })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "there was an error verifying your otp please try again later" })
    }

}

const reqNewOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const normalizedEmail = email.toLowerCase().trim();

        const user = await usersModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const newOTP = generateOtp();
        console.log(newOTP);


        await usersModel.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { otp: newOTP, verified: false } }
        );

        sendOtp(normalizedEmail, newOTP);

        return res.status(200).json({ message: "New OTP has been sent to your email" });
    } catch (error) {
        console.error("Error requesting new OTP:", error.message);
        return res.status(500).json({
            error: "Could not send new OTP. Please try again later.",
        });
    }
};


const signUserIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const findUser = await usersModel.findOne({ email: email })


        if (!findUser) {
            return res.status(400).json({ message: "user does not exist, check your details for correction or sign up" })
        }

        const parsedPassword = await bcrypt.compare(password, findUser.password)

        console.log(parsedPassword);


        if (!parsedPassword) {
            return res.status(400).json({ message: 'Incorrect password,check again or use the reset password button' })
        }

        const token = await generateToken(findUser.userId, findUser.role)
        const { password: _, ...user } = findUser._doc
        return res.status(200).send({
            message: 'sign in successful',
            token,
            user
        })


    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "We cant sign you in right now. please try again later" })
    }
}

const adminSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are both required." });
        }

        const findUser = await usersModel.findOne({ email });
        if (!findUser) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!["admin", "superAdmin"].includes(findUser.role)) {
            return res.status(403).json({ message: "Unauthorized user." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = await generateToken(findUser.userId, findUser.role);

        // Exclude password from the user object
        const { password: _, ...user } = findUser._doc;

        return res.status(200).json({
            message: "Sign-in successful.",
            token,
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "We can't sign you in right now. Please try again later." });
    }
};


const resetPassword = async (req, res) => {
    const { email } = req.body
    try {

        const findUser = await usersModel.findOne({ email: email })

        if (!findUser) {
            return res.status(400).json({ message: "user does not exist, proceed to create an account" })
        }

        const newOTP = generateOtp()

        console.log(newOTP);



        await usersModel.findOneAndUpdate({ email: email }, { $set: { otp: newOTP, } })
        sendOtp(email.toLowerCase(), newOTP)

        return res.status(200).json({ message: "an otp has been sent to your email" })

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "we are unable to reset your password now. please try again later" })
    }

}

const allUser = async (req, res) => {
    const findAllUser = await usersModel.find();
    try {
        if (findAllUser) {
            return res.status(200).json(findAllUser)
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "we are unable to get all users right now" })

    }
}

const deleteUser = async (req, res) => {
    const { items } = req.body;

    console.log(items);


    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Please provide a list of email(s) to delete."
        });
    }

    try {
        const result = await usersModel.deleteMany({
            email: { $in: items.map(email => email.toLowerCase().trim()) }
        });

        return res.status(200).json({
            message: `${result.deletedCount} user(s) deleted successfully.`
        });

    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({
            error: "There was an error deleting the user(s). Please try again later."
        });
    }
};

const newPasswordSetter = async (req, res) => {
    const { email, otp, password } = req.body

    try {
        if (!email || !otp || !password) {
            return res.status(400).json({ message: "your email, otp, and new password is required to perform this operation" })
        }

        const findUser = await usersModel.findOne({ email })
        if (!findUser) {
            return res.status(400).json({ message: "User not found" });
        }


        const hashedPw = await bcrypt.hash(password, 10)
        console.log(hashPassword);

        const update = await usersModel.findOneAndUpdate(
            { email },
            { $set: { password: hashedPw } }
        )

        return res.status(200).json({ message: "your password was updated successfully. you may proceed to login" })

    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({
            error: "There was an error deleting the user(s). Please try again later."
        });
    }


}

const userAuthentication = (req, res) => {
    const { token } = req.body
    try {
        const checkAuth = verifyToken(token)
        return res.status(200).json(checkAuth)
    } catch (error) {

    }

}


module.exports = {
    addUser,
    verifyOtp,
    reqNewOtp,
    signUserIn,
    adminSignIn,
    resetPassword,
    allUser,
    deleteUser,
    newPasswordSetter,
    userAuthentication
}
