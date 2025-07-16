import express from "express"
import UserController from "../../controllers/user/userController.js";

const userRouter=express.Router();

// user auth routes ============
userRouter.post("/login",UserController.userLogin);
userRouter.post("/register",UserController.userRegister);




export default userRouter;