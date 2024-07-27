import CommunityModel from "../../../../Model/Community.model.js";
import UserModel from "../../../../Model/User.model.js";
import { HTTP_CREATED, HTTP_OK } from "../../../../config/HttpCodes.js";
import { BadRequestError, NotFoundError } from "../../../../exceptions/app-exceptions.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";


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
        return HttpResponse.sendAPIResponse(res, data, HTTP_CREATED, 'community data fetched.');



    } catch (error) {

        next(error)
    }


}





export async function deleteData(req, res, next) {

    try {
        const { id, deleteType } = req.body;


        if (!deleteType) {
            throw new BadRequestError("Delete Type is not defined!");

        }



        if (deleteType == 'user') {

            const user = await UserModel.deleteOne({ _id: id });
            if (user) {
                return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'User Deleted');
            } else {
                throw new NotFoundError("does not exist!");

            }


        } else if (deleteType == 'community') {

            const community = await CommunityModel.deleteOne({ _id: id });
            const communityAdmin = await UserModel.deleteOne({ community: id, role: 'community_admin' });

            if (community) {
                return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Community Deleted');
            } else {
                throw new NotFoundError("does not exist!");

            }



        }




    } catch (error) {
        next(error)
    }

}