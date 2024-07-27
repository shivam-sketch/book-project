import Joi from "joi";
import { isValidObjectId, isValidPassword } from "../utils/helper.js";

const registerUserValidation = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
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
    year: Joi.string().required(),
  }),
};

const updateBookValidation = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    title: Joi.string().optional(),
    author: Joi.string().optional(),
    year: Joi.string().optional(),
    coverImage: Joi.string().optional(),
  }),
};

const deleteBookValidation = {
  body: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export {
  registerUserValidation,
  loginUserValidation,
  addBookValidation,
  updateBookValidation,
  deleteBookValidation,
};
