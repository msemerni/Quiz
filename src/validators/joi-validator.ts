// const { PASSWORD_PATTERN } = require("./constants/constants.js");
// const { PASSWORD_PATTERN } = process.env;

const Joi = require('joi');

const joiSchema = Joi.object({
    
    login: Joi
      .string()
      .required()
      .email(),
  
    password: Joi
      .string()
      .required()
      // .pattern(new RegExp(PASSWORD_PATTERN)),
      .pattern(new RegExp("^\w{3,20}$")),
  
    confirmPassword: Joi
      .string()
      .required()
      // .pattern(new RegExp(PASSWORD_PATTERN)),
      .pattern(new RegExp("^\w{3,20}$")),
  
    nick: Joi
      .string()
      .empty('')
      .max(50)
      .default('anon')
  });

  module.exports = joiSchema;
  