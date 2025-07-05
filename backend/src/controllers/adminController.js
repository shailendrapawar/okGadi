import { loginSchema, registrationSchema, adminInitSchema, resetPasswordSchema } from "../../validations/userValidation.js";
import bcrypt from "bcrypt"
import { registerAdminService, checkUserExistsByEmailOrMobile, findUserByEmailOrMobile, checkIfAdminExists, updateLoginMethodService, updateLoginAttemptCountService } from "../models/adminModel.js";
import jwt from "jsonwebtoken"

import { configDotenv } from "dotenv"
import { changePasswordService, isOtpVerifiedService } from "../models/authModel.js";
import lockUserAccount from "../helpers/lockUserAccount.js";
configDotenv();


class AdminController {

    // #======standard response ========#
    static standardResponse = (res, status, message, data) => {
        return res.status(status).json({
            message,
            data: data
        })
    }

    //A: INITIALIZE_ADMIN
    static initializeAdmin = async (req, res) => {

        try {

            // 1:- validating input======
            const { error, value } = adminInitSchema.validate(req.body);
            if (error) {
                this.standardResponse(res, 400, `Validation failed:- ${error.message}`, null)
            }
            const { password, } = value;

            // 2:- check for if any admin exists ===
            const doesExists = await checkIfAdminExists();

            if (doesExists) {
                return this.standardResponse(res, 403, "admin already initialized", null);
            }

            // 3:- hash password =====
            const salt = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hash(password, salt);

            // 4:- register user=====
            const isRegistred = await registerAdminService({ ...value, password: hash_password })
            return this.standardResponse(res, 201, "initial admin registration done", isRegistred);

        } catch (err) {
            console.log("Error in intializing admin",err.message)
            return this.standardResponse.apply(res, 500, "Internal server error", null)
        }
    }


    // B: ADMIN_REGISTRATION
    static adminRegister = async (req, res) => {
        try {
            // 1: validating inputs==========
            const { error, value } = registrationSchema.validate(req.body);
            if (error) {
                return this.standardResponse(res, 400, `validation failed:- ${error.message}`, null);
            }
            //2:- extracting only valid inputs=============
            const { email, password, mobile_number } = value;

            // 3:- searching if the user already exists =========
            const isExist = await checkUserExistsByEmailOrMobile({ mobile_number, email });

            if (isExist.length > 0) {
                return this.standardResponse(res, 400, "user already exists with these credentials", null);
            }

            // 4: hashing the password if user dosent exists======
            const salt = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hashSync(password, salt);

            // 5: creating user ==========
            const isRegistered = await registerAdminService({ ...value, password: hash_password, created_by: req.user.id });

            return this.standardResponse(res, 201, "registration successfull ", isRegistered)

        } catch (err) {

            console.log("Error in admin registration",err.message)
            return this.standardResponse.apply(res, 500, "Internal server error", null)
        }
    }


    // C: ADMIN_LOGIN
    static adminLogin = async (req, res) => {
        try {
            // 1:- validating inputs .......
            const { error, value } = loginSchema.validate(req.body);
            if (error) {
                return this.standardResponse(res, 400, `validation error :- ${error.message}`, null)
            }
            const { identifier, password } = value;


            // 2:- check for verified otp as well .......
            const isOtpVerified = await isOtpVerifiedService({ identifier_type:"email", identifier_value:identifier, user_role:"admin", purpose: "login" });
            if (!isOtpVerified) {
                return this.standardResponse(res, 400, "OTP is either expired or not verified", null);
            }

            // 3:- finding user if it exists .......
            const isExist = await findUserByEmailOrMobile({ identifier });
            const user = isExist.rows[0];
            console.log(user);

            if (isExist.rowCount <= 0) {
                return this.standardResponse(res, 400, 'user not registered', null);
            }

            //4: check for account lock .......
            if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
                return this.standardResponse(res, 403, `Account is locked until ${new Date(user.account_locked_until).toLocaleTimeString()}`, null);
            }


            // 3:- comparing passwords .......
            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                if (user.login_attempts >= 3) {
                    //lock account if attemp >=3
                    await lockUserAccount({ user_role: "admin", identifier_type:"email", identifier_value: identifier, lock_minutes: 15 })
                    return this.standardResponse(res, 403, "Too many login attempts. Account locked.", null);
                } 
                await updateLoginAttemptCountService({ identifier_type:"email", identifier_value: identifier, attempt_count: user.login_attempts + 1 })
                return this.standardResponse(res, 400, 'Incorrect username or password.', null);
            }

            // 4:- jwt signing .......
            const token = jwt.sign({
                role: user.role,
                id: user.id,
            }, process.env.JWT_SECRET_TOKEN,
                { expiresIn: "1d" }
            )

            // 5: reset attempt count .......
            await updateLoginAttemptCountService({ identifier_type:"email", identifier_value: identifier, attempt_count: 0 })

            // 5:- setting cookies .......
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            this.standardResponse(res, 200, "user logged in", { role: user.role, id: user.id })
        } catch (err) {
            console.log("Error in admin login",err.message);
            return this.standardResponse(res, 500, "Internal server error", null)
        }
    }


    // D: admin google sso linking
    static linkGoogleAccount = async (req, res) => {

        try {
            const { googleId, email, isEmailVerified } = req.googleProfile;

            // 1: check is user sso email is verified....
            if (!isEmailVerified) {
                return this.standardResponse(res, 400, "email not verified", null);
            }

            //2: check if the email with incoming google profile exists...
            const isExist = await findUserByEmailOrMobile({ identifier: email })
            if (!isExist.rowCount > 0) {
                return this.standardResponse(res, 400, "No account found with these credentials", null);
            }
            const user = isExist?.rows[0];


            //3: check if account already linked .......
            if (user.login_method === "both") {
                return this.standardResponse(res, 200, "Account is already linked with this profile", null);
            }

            // 4 : link account if not linked .......
            const isLinked = await updateLoginMethodService({ email: user.email, login_method: "both", googleId })

            if (!isLinked.rowCount > 0) {
                return this.standardResponse(res, 400, "Problem while updating admin login method", null);
            }

            return this.standardResponse(res, 200, "Google account linked successfully", null)

        } catch (err) {
            console.log("Error in admin googgle accont linking",err.message)
            return this.standardResponse(res, 500, "Internal server error", null)
        }
    }


    // E: admin google login
    static googleLogin = async (req, res) => {

        try {
            //1: search if user exist with this email .......
            const isExist = await findUserByEmailOrMobile({ identifier: req.googleProfile.email });

            if (!isExist.rowCount > 0) {
                return this.standardResponse(res, 400, "User not found", null);
            }


            // 2: check if login method includes both .......
            const user = isExist.rows[0];
            if (user.login_method !== "both" && user.login_method !== "google") {
                return this.standardResponse(res, 400, "Account not linked with google", null);
            }

            const { id, role } = user;

            // 3: generate JWT token .......
            const token = jwt.sign({
                role: role,
                id: id,
            }, process.env.JWT_SECRET_TOKEN,
                { expiresIn: "1d" }
            )

            //4: set in cookies .......
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return this.standardResponse(res, 200, "User logged in", { role: user.role, id: user.id })


        } catch (err) {
            console.log("Error in admin google login",err.message);
            return this.standardResponse(res, 500, "Internal server error", null)
        }
    }


    // F: reset password 
    static resetPassword = async (req, res) => {

        try {
            const { error, value } = resetPasswordSchema.validate(req.body);

            if (error) {
                return this.standardResponse(res, 400, `validation failed:- ${error.message}`, null);
            }

            const { identifier_type, identifier_value, user_role, newPassword } = value

            // 1: check if the otp for reseting passwword is verififed .......
            const isOtpVerified = await isOtpVerifiedService({ identifier_type, identifier_value, user_role, purpose: "reset_password" })

            if (!isOtpVerified) {
                return this.standardResponse(res, 400, "OTP is either expired or not verified", null);
            }


            //2: reset password .......
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newPassword, salt);

            const isPasswordChanged = await changePasswordService({ identifier_type, identifier_value, hashPassword });

            if (!isPasswordChanged.rowCount > 0) {
                return this.standardResponse(res, 400, "Error while changing password", null);
            }

            //3:  notify admin .......
            return this.standardResponse(res, 200, "Your password has been successfully reset.", null);

        } catch (err) {
            console.log("Error in admin reset password",err.message)
            return this.standardResponse(res, 500, "Internal server error.", null);
        }
    }


    static changePassword = async (req, res) => {

    }

}

export default AdminController