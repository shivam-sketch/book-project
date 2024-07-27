import mongoose from "mongoose";
import PostImagesModel from "../../../../Model/PostImages.Model.js";
import PostsModel, { CommentsModel } from "../../../../Model/Posts.model.js";

import ReportTypesModel from "../../../../Model/ReportTypes.Model.js";
import SellCategoriesModel from "../../../../Model/SellCategories.model.js";
import { HTTP_CREATED, HTTP_OK } from "../../../../config/HttpCodes.js";
import { BadRequestError, NotFoundError } from "../../../../exceptions/app-exceptions.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import ReportsModel from "../../../../Model/Reports.Model.js";
import ViolationsModel from "../../../../Model/Violations.Model.js";
import UserModel from "../../../../Model/User.model.js";
import EventsModel from "../../../../Model/Events.Model.js";
import { ObjectId } from "mongodb";




export async function addPosts(req, res, next) {

    try {

        const { postType, userId, imagePostDetails, sellDetails, serviceDetails, eventDetails, pollDetails, community } = req.body;
        let dataToSave = {
            postType, userId, community


        }
        if (imagePostDetails) {
            dataToSave['imagePostDetails'] = imagePostDetails
        }
        if (sellDetails) {
            dataToSave['sellDetails'] = sellDetails
        }
        if (serviceDetails) {
            dataToSave['serviceDetails'] = serviceDetails
        }
        if (eventDetails) {
            dataToSave['eventDetails'] = eventDetails
            console.log(eventDetails)

            let result = new EventsModel(eventDetails)
            await result.save()


        }
        if (pollDetails) {
            dataToSave['pollDetails'] = pollDetails
        }

        console.log(dataToSave)
        const newPost = new PostsModel(dataToSave);
        await newPost.save();
        return HttpResponse.sendAPIResponse(res, newPost, HTTP_CREATED, 'Post created.');




    } catch (error) {

        next(error)



    }




}




// export async function addPosts(req, res, next) {

//     try {

//         const { postType, userId, imagePostDetails, sellorMarketplaceDetails, eventDetails, pollDetails, community } = req.body;
//         let dataToSave = {
//             postType, userId, community
//         }
//         if (postType == "ImagePost") {
//             dataToSave['imagePostDetails'] = imagePostDetails
//         }

//         if (postType == "Sell/Marketplace") {




//             let newPost = await PostsModel.findOneAndUpdate({ postType: 'sellorMarketplaceDetails' }, { userId: userId, postType: postType, $push: { result: newEvent } }, { upsert: true, returnDocument: "after" })


//             return HttpResponse.sendAPIResponse(res, newPost, HTTP_CREATED, 'Post created.');
//         }
//         if (postType == "Event") {
//             dataToSave['eventDetails'] = eventDetails
//             console.log(eventDetails)

//             let newEvent = new EventsModel(eventDetails)
//             await newEvent.save()
//             let newPost = await PostsModel.findOneAndUpdate({ postType: 'Event', community }, { community, $push: { result: newEvent } }, { upsert: true, returnDocument: "after" })


//             return HttpResponse.sendAPIResponse(res, newPost, HTTP_CREATED, 'Post created.');
//         }
//         if (pollDetails) {
//             dataToSave['pollDetails'] = pollDetails
//         }

//         console.log(dataToSave)
//         // const newPost = new PostsModel(dataToSave);
//         // await newPost.save();




//     } catch (error) {

//         next(error)



//     }




// }




// get posts

export async function getPosts(req, res, next) {



    try {
        const { page = 1, limit = 10, community, userId, filterType } = req.body;
        if (!community) {
            throw new BadRequestError('Community id not defined')
        }
        const criteria = {
            // $expr: { userId },
            postType: { $in: filterType },
            community,
            reports: {
                $nin: [new mongoose.Types.ObjectId(req.user.userId)]
            },
            isActive: true,
            isDeleted: false
        };
        if (userId) {
            criteria['userId'] = new mongoose.Types.ObjectId(userId)
        }
        console.log('posts criteria', criteria)

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'authorDetails',
                }
            },
            {
                $unwind: '$authorDetails',
            },

            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "comments.commentedBy", // The field from the current collection
                    foreignField: "_id", // The field from the other collection
                    as: "commentsWithUser", // The name for the new array field
                },
            },
            {
                $project: {
                    userId: 1,
                    community: 1,
                    postType: 1,
                    likes: 1,
                    comments: 1,
                    shares: 1,
                    reports: 1,
                    likeCount: 1,
                    commentsCount: 1,
                    shareCount: 1,
                    imagePostDetails: 1,
                    sellDetails: 1,
                    serviceDetails: 1,
                    eventDetails: 1,
                    pollDetails: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isDeleted: 1,
                    'authorDetails.name': 1,
                    'authorDetails.image': 1,
                    'authorDetails.phone': 1,
                    'authorDetails.dialCode': 1,
                    'authorDetails.address': 1,


                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        userDetails: {
                                            $let: {
                                                vars: {
                                                    matchedUser: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$commentsWithUser",
                                                                    as: "users",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$users._id",
                                                                            "$$comment.commentedBy",
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    name: "$$matchedUser.name",
                                                    image: "$$matchedUser.image",
                                                    // Add more fields if needed
                                                },
                                            },
                                        },
                                        postId: "$_id",
                                    },
                                ],
                            },
                        },
                    },







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


        const [result] = await PostsModel.aggregate(aggregationPipeline);
        // image post criteria

        const imagePostcriteria = {
            // $expr: { userId },
            postType: 'ImagePost',
            community,
            reports: {
                $nin: [new mongoose.Types.ObjectId(req.user.userId)]
            },
            isActive: true,
            isDeleted: false
        };

        const imagePostAggregationPipeline = [
            {
                $match: imagePostcriteria,
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'authorDetails',
                }
            },
            {
                $unwind: '$authorDetails',
            },

            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "comments.commentedBy", // The field from the current collection
                    foreignField: "_id", // The field from the other collection
                    as: "commentsWithUser", // The name for the new array field
                },
            },
            {
                $project: {
                    userId: 1,
                    community: 1,
                    postType: 1,
                    likes: 1,
                    comments: 1,
                    shares: 1,
                    reports: 1,
                    likeCount: 1,
                    commentsCount: 1,
                    shareCount: 1,
                    imagePostDetails: 1,
                    sellDetails: 1,
                    serviceDetails: 1,
                    eventDetails: 1,
                    pollDetails: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isDeleted: 1,
                    'authorDetails.name': 1,
                    'authorDetails.image': 1,
                    'authorDetails.phone': 1,
                    'authorDetails.dialCode': 1,
                    'authorDetails.address': 1,


                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        userDetails: {
                                            $let: {
                                                vars: {
                                                    matchedUser: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$commentsWithUser",
                                                                    as: "users",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$users._id",
                                                                            "$$comment.commentedBy",
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    name: "$$matchedUser.name",
                                                    image: "$$matchedUser.image",
                                                    // Add more fields if needed
                                                },
                                            },
                                        },
                                        postId: "$_id",
                                    },
                                ],
                            },
                        },
                    },







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






        // console.log('agg data', await HouseOwnersModel.aggregate(aggregationPipeline))

        const [imagePostResults] = await PostsModel.aggregate(imagePostAggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        let imagePosts = paginatedResults?.filter((item) => item.postType == 'ImagePost')
        let eventData = paginatedResults?.filter((item) => item.postType == 'Event')
        let sellMarketPlaceData = paginatedResults?.filter((item) => item.postType == 'Sell' || item.postType == 'Service')
        let pollData = paginatedResults?.filter((item) => item.postType == 'Poll')

        let dataToSend = [...imagePosts, { postType: 'Event', result: eventData }, { postType: 'sell_marketplace', result: sellMarketPlaceData }]
        console.log(imagePostResults?.paginatedResults?.length == limit)
        if (imagePostResults?.paginatedResults?.length == limit) {
            let uniqueImagePosts = imagePostResults?.paginatedResults?.filter((item) => {
                if (dataToSend?.find((fi) => fi._id?.toString() == item._id?.toString() && fi.postType == item.postType)) {
                    console.log('did youc came?')
                    return false
                } else {
                    // console.log(dataToSend?.find((fi) => fi._id == item._id))
                    return true
                }
            })

            let j = 0
            for (let i = dataToSend.length; i < parseInt(limit); i++) {
                dataToSend[i] = uniqueImagePosts[j]
                j++
            }
        }



        const data = {
            result: dataToSend,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Posts Fetched Successfuly.');



    } catch (error) {

        next(error)
    }



}


// like posts

export async function likePost(req, res, next) {

    try {

        const { postId, userId } = req.body
        const post = await PostsModel.findOne({ _id: postId });
        if (!post) {
            throw new NotFoundError('Post does not exists')

        }

        const alreadyLiked = await PostsModel.find({
            _id: postId,
            likes: {
                $elemMatch: { $eq: userId }
            }
        });


        // console.log('already>>>', alreadyInterested)


        if (alreadyLiked?.length > 0) {

            let decrementCounter = await PostsModel.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: -1 }, $pull: { likes: userId } }, { returnDocument: "after" })
            isLikedByMe: decrementCounter.likes?.includes(userId) ? true : false
            return HttpResponse.sendAPIResponse(res, { likeCount: decrementCounter.likeCount, postId: decrementCounter._id, likes: decrementCounter.likes, isLikedByMe: decrementCounter.likes?.includes(userId) ? true : false }, HTTP_OK, 'Post disliked');


        } else {

            let incrementCounter = await PostsModel.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: 1 }, $push: { likes: userId } }, { returnDocument: "after" })
            console.log(incrementCounter)
            return HttpResponse.sendAPIResponse(res, { likeCount: incrementCounter.likeCount, postId: incrementCounter._id, likes: incrementCounter.likes, isLikedByMe: incrementCounter.likes?.includes(userId) ? true : false }, HTTP_OK, 'Post Liked');
        }






    } catch (error) {

        console.log('err', error)

        next(error)

    }




}


// upload-images

export async function uploadPostImages(req, res, next) {
    try {
        if (!req.files || req.files.length == 0) {
            throw new BadRequestError('Image Not Sent')

        }

        if (req.files.length > 5) {
            throw new BadRequestError('only 5 images are allowed !')

        }


        console.log(req.files)
        let imageArray = req.files?.map((item) => {
            return item.filename
        })

        const image = new PostImagesModel({
            name: imageArray,
            platformType: 'Post'
        });

        await image.save()

        return HttpResponse.sendAPIResponse(res, image, HTTP_OK, 'Image uploaded.');




    } catch (error) {

        next(error)
    }




}



// get sell categories


export async function getSellCategories(req, res, next) {



    try {
        const { page = 1, limit = 10, community } = req.body;
        if (!community) {
            throw new BadRequestError('Community id not defined')
        }
        console.log(req.body)
        const criteria = {
            community: new mongoose.Types.ObjectId(community),
            isActive: true,
            isDeleted: false
        };

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            // {
            //     $lookup: {
            //         from: 'communities',
            //         localField: 'community',
            //         foreignField: '_id',
            //         as: 'communityDetails',
            //     }
            // },
            // {
            //     $unwind: '$communityDetails',
            // },
            // {
            //     $project: {
            //         name: 1,
            //         community: 1,
            //         createdAt: 1,
            //         updatedAt: 1,
            //         isDeleted: 1,
            //     },
            // },

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
        // console.log('agg data', await HouseOwnersModel.aggregate(aggregationPipeline))

        const [result] = await SellCategoriesModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Sell Categories Fetched Successfuly.');



    } catch (error) {

        next(error)
    }



}





// post comment


export async function postComment(req, res, next) {

    try {

        const { postId, commentedBy, comment } = req.body
        const post = await PostsModel.findOne({ _id: postId });
        if (!post) {
            throw new NotFoundError('Post does not exists')

        }

        const newComment = new CommentsModel({ commentedBy, comment })
        await newComment.save()

        const updatedPost = await PostsModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 }, $push: { comments: newComment } }, { returnDocument: "after" })





        const aggregationPipeline = [
            {
                $match: { _id: updatedPost._id },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'authorDetails',
                }
            },
            {
                $unwind: '$authorDetails',
            },

            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "comments.commentedBy", // The field from the current collection
                    foreignField: "_id", // The field from the other collection
                    as: "commentsWithUser", // The name for the new array field
                },
            },
            {
                $project: {
                    userId: 1,
                    community: 1,
                    postType: 1,
                    likes: 1,
                    comments: 1,
                    shares: 1,
                    likeCount: 1,
                    commentsCount: 1,
                    shareCount: 1,
                    imagePostDetails: 1,
                    sellDetails: 1,
                    serviceDetails: 1,
                    eventDetails: 1,
                    pollDetails: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isDeleted: 1,
                    'authorDetails.name': 1,
                    'authorDetails.image': 1,
                    'authorDetails.phone': 1,
                    'authorDetails.dialCode': 1,
                    'authorDetails.address': 1,


                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        userDetails: {
                                            $let: {
                                                vars: {
                                                    matchedUser: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$commentsWithUser",
                                                                    as: "users",
                                                                    cond: {
                                                                        $eq: [
                                                                            "$$users._id",
                                                                            "$$comment.commentedBy",
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    name: "$$matchedUser.name",
                                                    image: "$$matchedUser.image",
                                                    // Add more fields if needed
                                                },
                                            },
                                        },
                                        postId: "$_id",
                                    },
                                ],
                            },
                        },
                    }




                },
            }
        ];
        // console.log('agg data', await HouseOwnersModel.aggregate(aggregationPipeline))

        const result = await PostsModel.aggregate(aggregationPipeline);



        return HttpResponse.sendAPIResponse(res, result[0], HTTP_OK, 'Commented on the Post');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}

// like comment


export async function likeComment(req, res, next) {

    try {

        const { postId, commentId, userId } = req.body
        const post = await PostsModel.findOne({ _id: postId });
        if (!post) {
            throw new NotFoundError('Post does not exists')

        }

        const alreadyLiked = await CommentsModel.find({
            _id: commentId,
            likes: {
                $elemMatch: { $eq: userId }
            }
        });


        // console.log('already>>>', alreadyInterested)


        if (alreadyLiked?.length > 0) {

            let decrementCounter = await CommentsModel.findOneAndUpdate({ _id: commentId }, { $inc: { likeCount: -1 }, $pull: { likes: userId } }, { returnDocument: "after" })
            let updatedPost = await PostsModel.findOneAndUpdate({ 'comments._id': commentId }, { 'comments.$.likes': decrementCounter.likes, 'comments.$.likeCount': decrementCounter.likeCount }, { returnDocument: "after" })
            // console.log('updasted post comments', updatedPost.comments)

            // isLikedByMe: decrementCounter.likes?.includes(userId) ? true : false
            return HttpResponse.sendAPIResponse(res, { likeCount: decrementCounter.likeCount, commentId: decrementCounter._id, likes: decrementCounter.likes, isLikedByMe: decrementCounter.likes?.includes(userId) ? true : false }, HTTP_OK, 'comment disliked');


        } else {

            let incrementCounter = await CommentsModel.findOneAndUpdate({ _id: commentId }, { $inc: { likeCount: 1 }, $push: { likes: userId } }, { returnDocument: "after" })
            // console.log(incrementCounter)
            let updatedPost = await PostsModel.findOneAndUpdate({ 'comments._id': commentId }, { 'comments.$.likes': incrementCounter.likes, 'comments.$.likeCount': incrementCounter.likeCount }, { returnDocument: "after" })
            // console.log('updasted post comments', updatedPost.comments)
            return HttpResponse.sendAPIResponse(res, { likeCount: incrementCounter.likeCount, commentId: incrementCounter._id, likes: incrementCounter.likes, isLikedByMe: incrementCounter.likes?.includes(userId) ? true : false }, HTTP_OK, 'comment Liked');
        }






    } catch (error) {

        console.log('err', error)

        next(error)

    }




}


export async function getReportTypes(req, res, next) {



    try {
        const { page = 1, limit = 15 } = req.query;

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

        const [result] = await ReportTypesModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Reports data fetched successfuly.');



    } catch (error) {
        next(error)
    }













}





// add report

export async function addReport(req, res, next) {

    try {

        const { reportType, userId, postId } = req.body;

        const newReport = new ViolationsModel({ reportType, userId, postId });
        await newReport.save();
        const updatedPost = await PostsModel.findOneAndUpdate({ _id: postId }, { $push: { reports: req.user.userId } }, { returnDocument: "after" })

        console.log(updatedPost)
        return HttpResponse.sendAPIResponse(res, newReport, HTTP_CREATED, 'Report created.');




    } catch (error) {

        next(error)



    }




}


// share post

export async function sharePost(req, res, next) {

    try {

        const { postId } = req.body
        const post = await PostsModel.findOne({ _id: postId });
        if (!post) {
            throw new NotFoundError('Post does not exists')

        }



        const updatedPost = await PostsModel.findOneAndUpdate({ _id: postId }, { $inc: { shareCount: 1 } }, { returnDocument: "after" })
        let result = {
            postId: updatedPost._id,
            shareCount: updatedPost.shareCount
        }

        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'Post shared');


    } catch (error) {

        console.log('err', error)

        next(error)

    }

}