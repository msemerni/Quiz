import { IUser } from "../types/project-types";
import Joi from "joi";
require('dotenv').config();
const { PASSWORD_PATTERN } = process.env;

const validateUserData = (user: IUser): Joi.ValidationResult<IUser> => {
  const joiSchema: Joi.ObjectSchema<IUser> = Joi.object({
    
    login: Joi
      .string()
      .required(),
  
    password: Joi
      .string()
      .required()
      .pattern(new RegExp(PASSWORD_PATTERN as string)),
   
    nick: Joi
      .string()
      .empty('')
      .max(50)
      .default('anon')
  });

  return joiSchema.validate(user);
};

export { validateUserData };
