import mongoose from "mongoose";
import CommunityModel from "../../../../Model/Community.model.js";
import NotificationModel from "../../../../Model/Notification.Model.js";
import { HTTP_CREATED, HTTP_OK } from "../../../../config/HttpCodes.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import UserModel from "../../../../Model/User.model.js";

export async function getCommunity(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.query;

        const criteria = {
            isActive: true,
            isDeleted: false
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (page - 1) * limit },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];
        console.log('agg data', await CommunityModel.aggregate(aggregationPipeline))

        const [result] = await CommunityModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'community data fetched.');


    } catch (error) {

        next(error)
    }




}




export async function addNotification(req, res, next) {

    try {

        const { title, message } = req.body;

        let allUsers = await UserModel.find({ isActive: true, isDeleted: false }, { _id: 1 })
        console.log(allUsers)
        let dataToSave = { title, message, users: allUsers?.map((item) => item._id) }



        const newNotification = new NotificationModel(dataToSave)
        await newNotification.save()



        return HttpResponse.sendAPIResponse(res, newNotification, HTTP_CREATED, 'Notification Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}



export async function getNotification(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.body;

        // pagination pipeline
        const criteria = {
            isActive: true,
            isDeleted: false,
            users: {
                $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userId) }
            }
        };
        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $project: {
                    title: 1,
                    message: 1,
                    createdAt: 1
                }


            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: (page - 1) * limit },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];

        const [result] = await NotificationModel.aggregate(aggregationPipeline);



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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Notifications fetched.');


    } catch (error) {

        next(error)
    }




}