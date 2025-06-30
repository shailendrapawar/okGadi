import Joi from "joi"

export const sendOtpSchema = Joi.object({
  identifier_type: Joi.string().valid('email', 'mobile').required(),

  identifier_value: Joi.string().when('identifier_type', {
    is: 'email',
    then: Joi.string().email().required(),
    otherwise: Joi.string().pattern(/^[6-9]\d{9}$/).required()
  }),

  user_role: Joi.string().valid("user", "admin").required(),
  purpose: Joi.string().valid("login", "signup", "reset_password").required(),
})




export const verifyOtpSchema = Joi.object({
  identifier_type: Joi.string().valid('email', 'mobile').required(),

  identifier_value: Joi.string().when('identifier_type', {
    is: 'email',
    then: Joi.string().email().required(),
    otherwise: Joi.string().pattern(/^[6-9]\d{9}$/).required()
  }),

  user_role: Joi.string().valid("user", "admin").required(),
  purpose: Joi.string().valid("login", "signup", "reset_password").required(),

  otp_code: Joi.string().min(6).max(6).required(),
})


