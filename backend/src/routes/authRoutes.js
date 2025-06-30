import express from "express";
import AuthController from '../controllers/authController.js'
import authMiddleware from "../middlewares/authMiddleware.js";

import checkRoleMiddleware from "../middlewares/checkRoleMIddleware.js";

const authRouter=express.Router();

authRouter.post("/send-otp",
    // authMiddleware,
    AuthController.sendOtp);
    
authRouter.post("/verify-otp",
    // authMiddleware,
    AuthController.verifyOtp);


export default authRouter; 