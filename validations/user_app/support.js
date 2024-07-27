import Joi from "joi"

const addTicketsValidations = {
    body: Joi.object().keys({
        userInfo: Joi.string().required(),
        subject: Joi.string().required(),
        description: Joi.string().required()
    }),
};

export { addTicketsValidations }