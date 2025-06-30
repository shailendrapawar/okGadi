import express from "express"
import AdminController from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import checkRoleMiddleware from "../middlewares/checkRoleMIddleware.js";
import passport from "passport";
import AuthController from "../controllers/authController.js";

const adminRouter = express.Router();



adminRouter.post("/init-admin", AdminController.initializeAdmin);
adminRouter.post("/login", AdminController.adminLogin);


//protected routes======== 
adminRouter.post("/register", authMiddleware, checkRoleMiddleware(['admin']), AdminController.adminRegister);



// link google account ========
adminRouter.get("/google-link",
    authMiddleware,
    checkRoleMiddleware(['admin']),
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    }))

adminRouter.get("/google-link/callback",
    authMiddleware,
    checkRoleMiddleware(['admin']),
    (req, res, next) => {
        passport.authenticate("google", {
            failureRedirect: "/",
            session: false
        }, (err, googleProfile, info) => {
            if (err) return next(err);
            if (!googleProfile) return res.redirect('/');
            req.googleProfile = googleProfile;

            next();
        })(req, res, next)
    }
    , AdminController.linkGoogleAccount);


    //========= SSO login route=========
adminRouter.get("/google-login",
    passport.authenticate("google-login",{
        scope:["profile","email"],
        prompt:"select_account"
    }))


adminRouter.get("/google-login/callback",
    (req, res, next) => {
        passport.authenticate("google-login", {
            failureRedirect: "/",
            session: false
        }, (err, googleProfile, info) => {
            
            if (err) return next(err);
            if (!googleProfile) return res.redirect('/');
            req.googleProfile = googleProfile;
            next();

        })(req, res, next)
    },
    AdminController.googleLogin
)


adminRouter.post("/reset-password",AdminController.resetPassword);

adminRouter.post("/change-password",authMiddleware,checkRoleMiddleware(['admin']),AdminController.changePassword);




export default adminRouter;