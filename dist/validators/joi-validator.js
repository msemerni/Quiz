"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PASSWORD_PATTERN } = require("./constants/constants.js");
const Joi = require('joi');
const joiSchema = Joi.object({
    login: Joi
        .string()
        .required()
        .email(),
    password: Joi
        .string()
        .required()
        .pattern(new RegExp(PASSWORD_PATTERN)),
    confirmPassword: Joi
        .string()
        .required()
        .pattern(new RegExp(PASSWORD_PATTERN)),
    nick: Joi
        .string()
        .empty('')
        .max(50)
        .default('anon')
});
exports.default = joiSchema;
