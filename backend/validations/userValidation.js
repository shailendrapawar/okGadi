import Joi from "joi"


const adminInitSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),

    mobile_number:Joi.string().pattern(/^[6-9]\d{9}$/),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).required(),
    secret:Joi.string().required()
})


const registrationSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),

    mobile_number:Joi.string().pattern(/^[6-9]\d{9}$/),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).required()
})


const loginSchema=Joi.object({
    identifier:Joi.string().email().required(),
    password:Joi.string().min(6).required()
})


const resetPasswordSchema=Joi.object({
   identifier_type: Joi.string().valid('email', 'mobile').required(),
   
   identifier_value: Joi.string().when('identifier_type', {
    is: 'email',
    then: Joi.string().email().required(),
    otherwise: Joi.string().pattern(/^[6-9]\d{9}$/).required()
  }),
    // purpose:Joi.string().valid("login","signup","password_reset").required(),
    user_role:Joi.string().valid("user","admin").required(),
    newPassword:Joi.string().required(),
})

export { registrationSchema,loginSchema,adminInitSchema,resetPasswordSchema }