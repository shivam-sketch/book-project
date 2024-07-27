import Joi from "joi";
import { isValidObjectId, isValidPassword } from "../../utils/helper.js";



const registerUserValidation = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        profileName: Joi.string().required(),
        bio: Joi.string().optional(),
        phone: Joi.string().min(7).max(14).required(),
        dialCode: Joi.string().required(),
        email: Joi.string().required().email(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        gender: Joi.string().valid(null, 'male', 'female', 'others').optional(), // Assuming 'gender' is required
        image: Joi.string().optional().allow(''),
        fcmToken: Joi.string().optional()
    }),
};




const updateProfileValidation = {
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


const checkSocialLoginValidation = {
    body: Joi.object().keys({
        email: Joi.string().required()
    }),
};



const resetPasswordValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required().custom(isValidPassword),
    }),
};





const setupPasswordValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required().custom(isValidPassword),
    }),
};



const setupProfileValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        gender: Joi.string().required(),
        interestedArtists: Joi.array().items(Joi.string().required('')).required(),

    }),
};



const changePasswordValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required().custom(isValidPassword),
    }),
};



const editInterestedArtistValidation = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        interestedArtists: Joi.array().items(Joi.string().required('')).required(),
    }),
};



export { registerUserValidation, loginUserValidation, resetPasswordValidation, changePasswordValidation, updateProfileValidation, checkSocialLoginValidation, setupPasswordValidation, setupProfileValidation, editInterestedArtistValidation }
