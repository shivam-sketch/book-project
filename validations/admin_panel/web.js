import Joi from "joi";

const addEventsValidation = {
    body: Joi.object().keys({
        hostedBy: Joi.string().required(),
        eventName: Joi.string().required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.array().items(Joi.string().allow('')),
        featuredArtists: Joi.array().items().required(),


    }),
};


// 


const addMusicsValidation = {
    body: Joi.object().keys({
        singers: Joi.array().items().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        featuredArtists: Joi.array().items().required(),
        image: Joi.string().required(),


    }),
};





export { addEventsValidation, addMusicsValidation }