const express = require("express")
const { addUser, 
        verifyOtp, 
        reqNewOtp, 
        signUserIn, 
        resetPassword, 
        allUser, 
        deleteUser, 
        newPasswordSetter, 
        userAuthentication, 
        adminSignIn } = require("../controlers/userControls")


const userRouter = express.Router()

userRouter.post("/register", addUser)
userRouter.post("/verify-otp", verifyOtp)
userRouter.post("/resend-otp", reqNewOtp)
userRouter.post("/sign-in", signUserIn)
userRouter.post("/admin-sign-in", adminSignIn)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/all-users", allUser)
userRouter.post("/delete-user", deleteUser)
userRouter.post("/set-new-password", newPasswordSetter)
userRouter.post("/authentication", userAuthentication)

module.exports = userRouter