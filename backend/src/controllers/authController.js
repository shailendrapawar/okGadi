import generateOTPWithExpiry from "../../utils/otpGenerator.js";
import { sendOtpSchema, verifyOtpSchema } from "../../validations/otpValidation.js";
import lockUserAccount from "../helpers/lockUserAccount.js";
import { checkMatchingOtpService, checkUnexpiredOtp, increaseOtpAttemptCount, insertOtpService, markOtpAsVerifiedService } from "../models/authModel.js";
import sendMail from "../services/mailService.js";
class AuthController {


    // ====STANDARD_RESPONSE==========#
    static standardResponse = (res, status, message, data) => {
        return res.status(status).json({
            message,
            data: data || null
        })
    }


    // A: SEND_OTP
    static sendOtp = async (req, res) => {

        try {

            // 1: validating input data======
            const { error, value } = sendOtpSchema.validate(req.body);

            if (error) {
                return this.standardResponse(res, 400, `validation error:- ${error.message}`, null);
            }

            // 2: generating otp with expiry
            const otpData = generateOTPWithExpiry();

            // 3:   check for latest unexpired OTP
            const isOtpExist = await checkUnexpiredOtp({ ...value, ...otpData })

            if (isOtpExist) {
                // return if unExpired otp exists
                return this.standardResponse(res, 400, "OTP already sent, Please wait", null);
            }

            // 4:- insert OTP ==========
            const isInserted = await insertOtpService({ ...value, ...otpData });

            if (!(isInserted.rowCount > 0)) {
                this.standardResponse(res, 400, "error while sending otp", null);
            }


            // 5: send otp via sms /mail
            if(value.identifier_type==="email"){
                await sendMail({to:`${value.identifier_value}`,subject:` OTP account ${value.purpose}`, html:`<h3>your OTP is: ${otpData.otp_code}</h3>`});
            }else if(value.identifier_type==="mobile"){
                //send sms
            }else{
                console.log("otp send to registered contact")
            }

            return this.standardResponse(res, 200, "An OTP has been sent to your registered contact.", isInserted.rows[0]);
        } catch (err) {
            console.log("Error in sending OTP ",err.message)
            return this.standardResponse(res, 500, "Internal server error", null);
        }
    }


    // B: verify OTP
    static verifyOtp = async (req, res) => {

        try {
            // 1: validating request=============
            const { error, value } = verifyOtpSchema.validate(req.body);
            if (error) {
                return this.standardResponse(res, 400, ` validation error ${error.message}`, null);
            }

            // 2:- searching matching OTP ==========
            const isMatch = await checkMatchingOtpService({ ...value })

            //if otp not found
            if (isMatch.rowCount <= 0) {
                return this.standardResponse(res, 400, "No OTP found or already verified.")
            }

            const otp = isMatch.rows[0];

            //3: check expiry====
            const now = new Date();
            if (new Date(otp.expires_at) < now) {
                return this.standardResponse(res, 400, "OTP has expired. Please request a new one.", null);
            }

            //4: check otp attempt count===
            if (otp.attempt_count >= 3) {

                // locking for admin and for the purpose of login only
                if (otp.purpose === "reset_password" && otp.user_role === "admin") {
                    //block account if 3 failed otp verifications for login
                    const { alreadyLocked, until } = await lockUserAccount({
                        user_role: otp.user_role,
                        identifier_type: otp.identifier_type,
                        identifier_value: otp.identifier_value
                    })

                    if (alreadyLocked) {
                        return this.standardResponse(res,403,`Account is already locked until ${new Date(until).toLocaleTimeString()}`,null);
                    }
                }
                return this.standardResponse(res, 400, `Too many incorrect attempts. Your account has been temporarily locked.”`, null);
            }

            // 5: compare otp
            const { otp_code } = value
            if (otp.otp_code !== otp_code) {
                // Increment attempt count
                await increaseOtpAttemptCount({ id: otp.id })
                return this.standardResponse(res, 400, `The OTP entered is incorrect. You have ${3 - otp.attempt_count} attempts left.`, null);
            }

            // 5 if correct mark verified==
            await markOtpAsVerifiedService({ otp_id: otp.id });
            this.standardResponse(res, 200, "Otp successfully verified", null)

        } catch (err) {
            console.log("Error in veriying OTP",err.message)
            return this.standardResponse(res, 500, "Internal server error", null);

        }
    }



}

export default AuthController;