import Joi from 'joi'

const addPostValidation = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
        postType: Joi.string().valid('Sell', 'Event', 'Poll', 'Service', 'ImagePost').required(),
        community: Joi.string().required(),
        imagePostDetails: Joi.when('postType', {
            is: 'ImagePost',
            then: Joi.object({
                images: Joi.array().items(Joi.string().allow('')),
                caption: Joi.string().trim()


            }),
            otherwise: Joi.forbidden(),
        }),
        sellDetails: Joi.when('postType', {
            is: 'Sell',
            then: Joi.object({
                productName: Joi.string().trim().required(),
                location: Joi.string().trim().required(),
                category: Joi.string().trim().required(),
                condition: Joi.string().trim().required(),
                price: Joi.number().default(0).required(),
                description: Joi.string().required(),
                image: Joi.array().items(Joi.string().allow(''))

            }),
            otherwise: Joi.forbidden(),
        }),
        serviceDetails: Joi.when('postType', {
            is: 'Service',
            then: Joi.object({
                serviceOffering: Joi.string().required(),
                serviceName: Joi.string().required(),
                price: Joi.number().default(0).required(),
                description: Joi.string().required(),
                image: Joi.array().items(Joi.string().allow(''))


            }),
            otherwise: Joi.forbidden(),
        }),
        eventDetails: Joi.when('postType', {
            is: 'Event',
            then: Joi.object({
                userId: Joi.string().required(),

                eventName: Joi.string().required(),
                community: Joi.string().required(),
                startDate: Joi.date().iso().required(),
                endDate: Joi.date().iso().required(),
                location: Joi.string().trim().required(),
                description: Joi.string().required(),
                startTime: Joi.string().required(),
                endTime: Joi.string().required(),
                image: Joi.array().items(Joi.string().allow('')),

            }),
            otherwise: Joi.forbidden(),
        }),
        pollDetails: Joi.when('postType', {
            is: 'Poll',
            then: Joi.object({
                question: Joi.string().required(),
                options: Joi.array().items(Joi.string()),
            }),
            otherwise: Joi.forbidden(),
        }),
    }).options({ stripUnknown: true }),
}


const postLikeValidation = {
    body: Joi.object().keys({
        postId: Joi.string().required(),
        userId: Joi.string().required(),


    }),
};

const postCommentValidation = {
    body: Joi.object().keys({
        postId: Joi.string().required(),
        commentedBy: Joi.string().required(),
        comment: Joi.string().required(),


    }),
};


const commentLikeValidation = {
    body: Joi.object().keys({
        postId: Joi.string().required(),
        commentId: Joi.string().required(),
        userId: Joi.string().required(),


    }),
};

const addReportValidation = {
    body: Joi.object().keys({
        reportType: Joi.string().required(),
        userId: Joi.string().required(),
        postId: Joi.string().required()


    }),
};












export { addPostValidation, postLikeValidation, postCommentValidation, commentLikeValidation, addReportValidation }