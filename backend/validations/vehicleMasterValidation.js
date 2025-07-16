import Joi from "joi";

export const addVehicleSchema = Joi.object({
  // icon_url: Joi.required(),
  vehicle_category: Joi.string().valid("transport", "machinery").required(),
  vehicle_type: Joi.string().required(),
  body_type: Joi.string().valid("half", "full").required(),
  range_km: Joi.number().precision(2).positive().required(),

  payload_min: Joi.when('vehicle_category', {
    is: 'transport',
    then: Joi.number().positive().required(),
    otherwise: Joi.valid(null).strip()   // null or omitted ✔
  }),
  payload_max: Joi.when('vehicle_category', {
    is: 'transport',
    then: Joi.number().positive().required(),
    otherwise: Joi.valid(null).strip()   // null or omitted ✔
  }),

})

export const updateVehicleSchema = Joi.object({
  id:Joi.number().integer().positive().required(),
  vehicle_category: Joi.string().valid("transport", "machinery").required(),
  vehicle_type: Joi.string().required(),
  body_type: Joi.string().valid("half", "full").required(),
  range_km: Joi.number().precision(2).positive().required(),

  payload_min: Joi.when('vehicle_category', {
    is: 'transport',
    then: Joi.number().positive().required(),
    otherwise: Joi.valid(null).strip()   // null or omitted ✔
  }),
  payload_max: Joi.when('vehicle_category', {
    is: 'transport',
    then: Joi.number().positive().required(),
    otherwise: Joi.valid(null).strip()   // null or omitted ✔
  }),
})