import Joi from 'joi'
const addAnnouncementsValidations = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        message: Joi.string().required(),
        announcementType: Joi.string().valid('global', 'community').required(),
        community: Joi.string().when('announcementType', { 'is': 'community', then: Joi.string().required() }),
        dateAndTime: Joi.string().optional()

    }),
};

export { addAnnouncementsValidations }