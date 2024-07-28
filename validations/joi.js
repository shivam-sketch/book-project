import Joi from "joi";
import { isValidObjectId, isValidPassword } from "../utils/helper.js";

const registerUserValidation = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("Admin", "Author", "Reader").required(),
  }),
};

const loginUserValidation = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const addBookValidation = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    author: Joi.string().required(),
    year: Joi.number().required(),
  }),
};

const updateBookValidation = {
  body: Joi.object().keys({
    id: Joi.string().required().custom(isValidObjectId),
    title: Joi.string().optional(),
    author: Joi.string().optional(),
    year: Joi.number().optional(),
    coverImage: Joi.string().optional(),
  }),
};

const deleteBookValidation = {
  body: Joi.object().keys({
    id: Joi.string().required().custom(isValidObjectId),
  }),
};

export {
  registerUserValidation,
  loginUserValidation,
  addBookValidation,
  updateBookValidation,
  deleteBookValidation,
};
