import Joi from 'joi'
const addNotificationValidation = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        message: Joi.string().required(),
        users: Joi.array().items(Joi.string()).optional(),

    }),
};

export { addNotificationValidation }