import Joi from 'joi'

const editPrivacyPolicyValidation = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        id: Joi.string().required(),
    })
};


const addPrivacyPolicyValidation = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
    })
};


const addDialCodesValidation = {
    body: Joi.object().keys({
        countryName: Joi.string().required(),
        countryCode: Joi.string().required(),
    })
};




const editTermsAndConditionsValidation = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        id: Joi.string().required(),
    })
};


const addTermsAndConditionsValidations = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
    })
};




export { editPrivacyPolicyValidation, addPrivacyPolicyValidation, addTermsAndConditionsValidations, editTermsAndConditionsValidation, addDialCodesValidation }