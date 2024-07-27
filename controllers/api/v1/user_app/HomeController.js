
import EventsModel from "../../../../Model/Events.Model.js";
import FeaturedModel from "../../../../Model/Featured.model.js";
import MusicModel from "../../../../Model/Music.model.js";
import { HTTP_CREATED, HTTP_OK } from "../../../../config/HttpCodes.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../../exceptions/app-exceptions.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import { emailValidator } from "../../../../utils/helper.js";

export async function getMusics(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.body;



        const criteria = {
            isActive: true,
            isDeleted: false
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'singers',
                    foreignField: '_id',
                    pipeline: [
                        { $project: { _id: 1, name: 1 } }
                    ],
                    as: 'singerDetails',
                }
            },
            // {
            //     $unwind: '$singerDetails',
            // },

            {
                $lookup: {
                    from: 'artists',
                    localField: 'featuredArtists',
                    foreignField: '_id',
                    pipeline: [
                        { $project: { _id: 1, name: 1 } }
                    ],
                    as: 'featuredArtistDetails',
                }
            },






            {
                $project: {
                    'singerNames': '$singerDetails',
                    'featuredArtistNames': '$featuredArtistDetails',
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isDeleted: 1,
                },
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];

        const [result] = await MusicModel.aggregate(aggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const data = {
            result: paginatedResults,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Musics fetched successfuly.');



    } catch (error) {

        next(error)
    }


}



// get events




export async function getEvents(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.body;



        const criteria = {
            hostedBy: "DNB All Stars",
            isActive: true,
            isDeleted: false
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },

            {
                $project: {
                    'featuredArtists.name': 1,
                    hostedBy: 1,
                    eventName: 1,
                    startDate: 1,
                    endDate: 1,
                    startTime: 1,
                    endTime: 1,
                    location: 1,
                    description: 1,
                    image: 1,
                    interestedCount: 1,
                    interestedUserIds: 1,
                    interestedByMe: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isDeleted: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];

        const [result] = await EventsModel.aggregate(aggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const data = {
            result: paginatedResults,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }

        let dataToSend = paginatedResults?.map((item) => {
            return { ...item, interestedByMe: item.interestedUserIds?.includes(req.user.userId) ? true : false }
        })

        return HttpResponse.sendAPIResponse(res, dataToSend, HTTP_OK, 'Events fetched successfuly.');



    } catch (error) {

        next(error)
    }


}



// get featured

export async function getFeatured(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.body;



        const criteria = {
            hostedBy: "DNB All Stars",
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];

        const [result] = await FeaturedModel.aggregate(aggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const data = {
            result: paginatedResults,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Featured successfuly.');



    } catch (error) {

        next(error)
    }


}

// interested in post


export async function interestedPost(req, res, next) {

    try {

        const { eventId } = req.body
        const event = await EventsModel.findOne({ _id: eventId });
        if (!event) {
            throw new NotFoundError('Event does not exists')
        }

        const alreadyInterested = await EventsModel.find({
            _id: eventId,
            interestedUserIds: {
                $elemMatch: { $eq: req.user.userId }
            }
        });


        // console.log('already>>>', alreadyInterested)


        if (alreadyInterested?.length > 0) {

            let decrementCounter = await EventsModel.findOneAndUpdate({ _id: eventId }, { $inc: { interestedCount: -1 }, $pull: { interestedUserIds: req.user.userId } }, { returnDocument: "after" })

            let filteredEventsOnInterest = { ...decrementCounter, interestedByMe: decrementCounter.interestedUserIds?.includes(req.user.userId) ? true : false }
            let dataToSend = { ...filteredEventsOnInterest._doc, interestedByMe: decrementCounter.interestedUserIds?.includes(req.user.userId) ? true : false }

            console.log('decrementCounter', filteredEventsOnInterest)
            return HttpResponse.sendAPIResponse(res, dataToSend, HTTP_OK, 'Post Uninterested !');


        } else {

            let incrementCounter = await EventsModel.findOneAndUpdate({ _id: eventId }, { $inc: { interestedCount: 1 }, $push: { interestedUserIds: req.user.userId } }, { returnDocument: "after" })
            // console.log('hey there', incrementCounter.interestedUserIds, req.user.userId)
            let filteredEventsOnInterest = { ...incrementCounter, interestedByMe: incrementCounter.interestedUserIds?.includes(req.user.userId) ? true : false }
            let dataToSend = { ...filteredEventsOnInterest._doc, interestedByMe: incrementCounter.interestedUserIds?.includes(req.user.userId) ? true : false }
            return HttpResponse.sendAPIResponse(res, dataToSend, HTTP_OK, 'new interest recorded.');
        }


    } catch (error) {

        console.log('err', error)

        next(error)

    }


}



// interested events


export async function interestedEvents(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.body;



        const criteria = {

            interestedUserIds: {
                $elemMatch: { $eq: req.user.userId }
            }
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];

        const [result] = await EventsModel.aggregate(aggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const data = {
            result: paginatedResults,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Interested Events Fetched successfuly.');



    } catch (error) {

        next(error)
    }


}