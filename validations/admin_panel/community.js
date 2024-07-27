import Joi from "joi"

const toggleCommunityStatusValidation = {
    body: Joi.object().keys({
        communityId: Joi.string().required(),
        status: Joi.boolean().required(),

    }),
};
export { toggleCommunityStatusValidation }