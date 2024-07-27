import Joi from "joi";
import { communityValidator, isValidPassword } from "../../utils/helper.js";

const registerUserValidation = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(isValidPassword),
        role: Joi.string().required()
    }),
};



const addUsersValidation = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        profileName: Joi.string().required(),
        bio: Joi.string().optional(),
        phone: Joi.string().min(7).max(14).required(),
        dialCode: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(isValidPassword),
        country: Joi.string().required(),
        city: Joi.string().required(),
        gender: Joi.string().valid(null, 'Male', 'Female', 'Others').optional(), // Assuming 'gender' is required
        image: Joi.string().optional().allow(''),
        interestedArtists: Joi.array().items(Joi.string().required('')).required(),
        fcmToken: Joi.string().optional()
    }),
};





const editUsersValidation = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        profileName: Joi.string().required(),
        bio: Joi.string().optional(),
        dialCode: Joi.string().required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        gender: Joi.string().valid(null, 'Male', 'Female', 'Others').optional(), // Assuming 'gender' is required
        image: Joi.string().optional().allow(''),
        password: Joi.string().required().custom(isValidPassword),
        interestedArtists: Joi.array().items(Joi.string().optional('')).optional().allow(''),
    }),
};





const loginUserValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required().custom(isValidPassword)
    }),
};


const resetPasswordValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required().custom(isValidPassword)
    }),
};



// toggle user validation



const toggleUserStatusValidation = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
        status: Joi.boolean().required(),

    }),
};




const getUserValidation = {
    body: Joi.object().keys({
        page: Joi.number().optional(),
        limit: Joi.number().optional()
    }),
};




export { registerUserValidation, loginUserValidation, resetPasswordValidation, addUsersValidation, editUsersValidation, toggleUserStatusValidation, getUserValidation }
