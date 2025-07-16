import express from "express"
import AdminAuthController from "../../controllers/admin/adminAuthController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import checkRoleMiddleware from "../../middlewares/checkRoleMIddleware.js";
import passport from "passport";
import AuthController from "../../controllers/authController.js";

const adminAuthRouter = express.Router();



adminAuthRouter.post("/init-admin", AdminAuthController.initializeAdmin);
adminAuthRouter.post("/login", AdminAuthController.adminLogin);


//protected routes======== 
adminAuthRouter.post("/register", authMiddleware, checkRoleMiddleware(['admin']), AdminAuthController.adminRegister);



// link google account ========
adminAuthRouter.get("/google-link",
    authMiddleware,
    checkRoleMiddleware(['admin']),
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    }))

adminAuthRouter.get("/google-link/callback",
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
    , AdminAuthController.linkGoogleAccount);


    //========= SSO login route=========
adminAuthRouter.get("/google-login",
    passport.authenticate("google-login",{
        scope:["profile","email"],
        prompt:"select_account"
    }))


adminAuthRouter.get("/google-login/callback",
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
    AdminAuthController.googleLogin
)


adminAuthRouter.post("/reset-password",AdminAuthController.resetPassword);

adminAuthRouter.post("/change-password",authMiddleware,checkRoleMiddleware(['admin']),AdminAuthController.changePassword);




export default adminAuthRouter;