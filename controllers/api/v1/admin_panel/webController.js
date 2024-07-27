import AboutUsModel from "../../../../Model/AboutUs.Model.js";
import AnnouncementsModel from "../../../../Model/Announcements.model.js";
import EventsModel from "../../../../Model/Events.Model.js";
import PrivacyPolicyModel from "../../../../Model/PrivacyPolicy.Model.js";
import TermsAndConditionModel from "../../../../Model/TermsAndCondition.model.js";
import TicketsModel from "../../../../Model/Tickets.Model.js";
import UserModel from "../../../../Model/User.model.js";
import ViolationsModel from "../../../../Model/Violations.Model.js";
import { HTTP_CONFLICT, HTTP_CREATED, HTTP_FORBIDDEN, HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../../../config/HttpCodes.js";
import { BadRequestError, NotFoundError } from "../../../../exceptions/app-exceptions.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import bcrypt from 'bcrypt'
import { generatePassword, passwordHasher } from "../../../../utils/helper.js";
import ArtistsModel from "../../../../Model/Artists.model.js";
import MusicModel from "../../../../Model/Music.model.js";
import FeaturedModel from "../../../../Model/Featured.model.js";
import FaqModel from "../../../../Model/Faq.model.js";



export async function getDashBoardStats(req, res, next) {

    try {

        let usersCount = await UserModel.countDocuments({ role: 'user', isDeleted: false })
        let eventsCount = await EventsModel.countDocuments({ isActive: true, isDeleted: false })
        let violationsCount = await ViolationsModel.countDocuments({ isActive: true, isDeleted: false })




        let statsObj = {
            usersCount, eventsCount, violationsCount
        }
        return HttpResponse.sendAPIResponse(res, statsObj, HTTP_OK, 'dashboard stats');



    } catch (error) {
        next(error)

    }

}


export async function register(req, res, next) {

    try {

        const { name, profileName, bio, phone, dialCode, email, password, country, city, gender, image, interestedArtists } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return HttpResponse.sendAPIResponse(res, {}, HTTP_CONFLICT, 'User Already Added.');
        }

        let hashedPassword = await passwordHasher(req.body.password)

        const user = new UserModel({ name, profileName, bio, phone, dialCode, email, password: hashedPassword, country, city, gender, image, interestedArtists, isDetailsCompleted: true, isEmailVerified: true });
        await user.save();

        // Send verification OTP
        // const OTP = await user.generateOTP();
        // await user.save();

        let cred = { _id: user._id, name: user.name, email: user.email }
        // await sendEmailVerificationOTP(cred)
        return HttpResponse.sendAPIResponse(res, cred, HTTP_CREATED, 'User Added Successfully.');


    } catch (error) {
        next(error)
    }

}


export async function getUsers(req, res, next) {

    try {
        const { page = 1, limit = 10 } = req.body;

        const criteria = {
            isDeleted: false,
            isEmailVerified: true,
            isDetailsCompleted: true

        };

        console.log(criteria)

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            // {
            //     $lookup: {
            //         from: 'communities', // Assuming your user collection is named 'users'
            //         localField: 'community',
            //         foreignField: '_id',
            //         as: 'communityDetails',
            //     }
            // },
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
        // console.log('agg data', await UserModel.aggregate(aggregationPipeline))

        const [result] = await UserModel.aggregate(aggregationPipeline);

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
        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Users data fetched.');



    } catch (error) {

        next(error)
    }

}




export async function editUsers(req, res, next) {

    try {



        const { name, profileName, bio, dialCode, country, city, gender, image, interestedArtists } = req.body;
        const user = await UserModel.findOne({ email: req.user.email });
        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {

            let hashedPassword = await bcrypt.compare(req.body.password, user.password)
            if (hashedPassword) {

                let dataToUpdate = { name, profileName, bio, dialCode, country, city, gender, image, interestedArtists }
                let updatedUser = await UserModel.findByIdAndUpdate(user._id, dataToUpdate, { new: true }).select({ password: 0, isDeleted: 0, isApproved: 0, isActive: 0, verificationOTP: 0, isPhoneVerified: 0, isEmailVerified: 0 })
                return HttpResponse.sendAPIResponse(res, updatedUser, HTTP_OK, 'Profile Updated.');
            } else {
                throw new AuthorizeError("Password Incorrect");

            }


        }










    } catch (error) {

        console.log('err', error)
        next(error)



    }

}











export async function toggleUserStatus(req, res, next) {

    try {
        const { userId, status } = req.body;

        let result = await UserModel.updateOne({ _id: userId }, { isActive: status });
        console.log(result)
        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'status changed.');




    } catch (error) {
        next(error)
    }

}



// 


export async function toggleUserApprovalStatus(req, res, next) {

    try {
        const { userId, status } = req.body;

        let result = await UserModel.updateOne({ _id: userId }, { isApproved: status, isEmailVerified: true });
        console.log(result)
        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'status changed.');




    } catch (error) {
        next(error)
    }

}



export async function addAboutUs(req, res, next) {

    try {

        const { about } = req.body;
        const newAboutUs = await AboutUsModel.replaceOne({ isActive: true }, { about }, { upsert: 1 })



        return HttpResponse.sendAPIResponse(res, newAboutUs, HTTP_CREATED, 'About Us Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}

// 



export async function addPrivacyPolicy(req, res, next) {

    try {

        const { title, description } = req.body;
        const newPrivacyPolicy = new PrivacyPolicyModel({ title, description })
        await newPrivacyPolicy.save()



        return HttpResponse.sendAPIResponse(res, newPrivacyPolicy, HTTP_CREATED, 'New Privacy Policy Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}




export async function addTermsAndCondition(req, res, next) {

    try {

        const { title, description } = req.body;
        const newTermsAndCondition = new TermsAndConditionModel({ title, description })
        await newTermsAndCondition.save()



        return HttpResponse.sendAPIResponse(res, newTermsAndCondition, HTTP_CREATED, 'New Terms Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}




export async function getAboutUs(req, res, next) {



    try {
        const aboutUs = await AboutUsModel.find({ isActive: true }, { about: 1 })


        return HttpResponse.sendAPIResponse(res, aboutUs, HTTP_OK, 'About Us Fetched Successfuly.');




    } catch (error) {
        next(error)
    }


}



export async function getPrivacyPolicy(req, res, next) {



    try {
        const privacyPolicy = await PrivacyPolicyModel.find({ isDeleted: false }).select({ title: 1, description: 1, isActive: 1 })


        return HttpResponse.sendAPIResponse(res, privacyPolicy, HTTP_OK, 'Privacy Policy Fetched Successfuly.');




    } catch (error) {
        next(error)
    }



}






export async function getTermsAndCondition(req, res, next) {



    try {
        const termsAndCondition = await TermsAndConditionModel.find({ isDeleted: false }).select({ title: 1, description: 1, isActive: 1 })


        return HttpResponse.sendAPIResponse(res, termsAndCondition, HTTP_OK, 'Terms and Conditions Fetched Successfuly.');




    } catch (error) {
        next(error)
    }

}



// 



export async function editTermsAndConditions(req, res, next) {

    try {
        const { title, description, id } = req.body;
        const dataToUpdate = { title, description }
        let result = await TermsAndConditionModel.updateOne({ _id: id }, dataToUpdate);

        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'data edited.');




    } catch (error) {
        next(error)
    }

}





export async function editPrivacyPolicy(req, res, next) {

    try {
        const { title, description, id } = req.body;
        const dataToUpdate = { title, description }
        let result = await PrivacyPolicyModel.updateOne({ _id: id }, dataToUpdate);

        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'data edited.');




    } catch (error) {
        next(error)
    }

}




// 


export async function deletePrivacyPolicy(req, res, next) {

    try {
        const { id } = req.body;


        const deletedData = await PrivacyPolicyModel.updateOne({ _id: id }, { isDeleted: true });
        if (deletedData) {
            return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Privacy Policy Deleted');
        } else {
            throw new NotFoundError("does not exist!");

        }

    } catch (error) {
        next(error)
    }

}




// 


export async function deleteTermsAndConditions(req, res, next) {

    try {
        const { id } = req.body;


        const deletedData = await TermsAndConditionModel.updateOne({ _id: id }, { isDeleted: true });
        if (deletedData) {
            return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Terms And Conditions Deleted');
        } else {
            throw new NotFoundError("does not exist!");

        }

    } catch (error) {
        next(error)
    }

}



// 


export async function addFaq(req, res, next) {

    try {

        const { title, description } = req.body;
        const newFaq = new FaqModel({ title, description })
        await newFaq.save()



        return HttpResponse.sendAPIResponse(res, newFaq, HTTP_CREATED, 'New Terms Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}







// 





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
















export async function togglePrivacyPolicy(req, res, next) {

    try {
        const { id, status } = req.body;

        let result = await PrivacyPolicyModel.updateOne({ _id: id }, { isActive: status });
        console.log(result)
        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'status changed.');




    } catch (error) {
        next(error)
    }

}



// 



export async function toggleTermsAndConditions(req, res, next) {

    try {
        const { id, status } = req.body;

        let result = await TermsAndConditionModel.updateOne({ _id: id }, { isActive: status });
        console.log(result)
        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'status changed.');




    } catch (error) {
        next(error)
    }

}



// 



export async function getUserTickets(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.query;

        const criteria = {
            helpType: "user",
            isDeleted: false
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
        // console.log('agg data', await HouseOwnersModel.aggregate(aggregationPipeline))

        const [result] = await TicketsModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Tickets Fetched Successfuly.');



    } catch (error) {

        next(error)
    }



}

// 

export async function getCommunityTickets(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.query;

        const criteria = {
            helpType: "community",
            isDeleted: false
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
        // console.log('agg data', await HouseOwnersModel.aggregate(aggregationPipeline))

        const [result] = await TicketsModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Tickets Fetched Successfuly.');



    } catch (error) {

        next(error)
    }



}



// 





export async function addGlobalAnnouncements(req, res, next) {

    try {

        const { title, message, announcementType, dateAndTime } = req.body;
        const newGlobalAnnouncement = new AnnouncementsModel({ title, message, announcementType, dateAndTime })
        await newGlobalAnnouncement.save()



        return HttpResponse.sendAPIResponse(res, newGlobalAnnouncement, HTTP_CREATED, 'New Global Announcement Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}



// 



export async function getGlobalAnnouncements(req, res, next) {



    try {
        const { page = 1, limit = 10, community } = req.body;

        const criteria = {
            announcementType: 'global',
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
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    totalCount: [
                        { $count: 'value' },
                    ],
                },
            },
        ];
        console.log('agg data', await AnnouncementsModel.aggregate(aggregationPipeline))

        const [result] = await AnnouncementsModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Announcements data fetched successfuly.');



    } catch (error) {

        next(error)
    }


}



//add featured

export async function addFeatured(req, res, next) {
    try {
        if (!req.files?.length) {
            throw new BadRequestError("Video Not Sent !");

        }

        if (req.files[0].size > 10000000) {
            throw new BadRequestError("Video size limit exceed than 10Mb !");

        }


        const { hostedBy, name } = req.body;


        let result = new FeaturedModel({ hostedBy, video: req.files[0].filename, name, platformType: 'App' })
        await result.save()

        return HttpResponse.sendAPIResponse(res, result, HTTP_CREATED, 'featured video added.');

    } catch (error) {
        next(error)
    }

}





// add-events


export async function addEvents(req, res, next) {
    try {
        const { hostedBy, eventName, startDate, endDate, startTime, endTime, location, description, image, featuredArtists } = req.body;

        let artists = await ArtistsModel.find({ _id: { $in: featuredArtists } })
        console.log(artists)

        let result = new EventsModel({ hostedBy, eventName, startDate, endDate, startTime, endTime, location, description, image, featuredArtists: artists })
        await result.save()

        return HttpResponse.sendAPIResponse(res, result, HTTP_CREATED, 'Event added.');




    } catch (error) {
        next(error)
    }

}



// add-musics



export async function addMusics(req, res, next) {
    try {
        const { singers, title, description, featuredArtists, image } = req.body;




        let result = new MusicModel({ singers, title, description, featuredArtists, image })
        await result.save()

        return HttpResponse.sendAPIResponse(res, result, HTTP_CREATED, 'Music added.');




    } catch (error) {
        next(error)
    }

}




// 





export async function addArtists(req, res, next) {

    try {

        const { name } = req.body;

        let result = new ArtistsModel({ name: name })
        await result.save()
        return HttpResponse.sendAPIResponse(res, result, HTTP_CREATED, 'Artist Added.');




    } catch (error) {
        next(error)
    }

}




export async function getCommunities(req, res, next) {

    try {
        const { page = 1, limit = 10, filter } = req.body;

        const criteria = {
            isDeleted: false,

        };


        if (filter == 'Active') {

            criteria['isActive'] = true


        } else if (filter == 'Inactive') {
            criteria['isActive'] = false

        }
        console.log(criteria)

        const aggregationPipeline = [
            {
                $match: criteria,
            },
            // {
            //     $lookup: {
            //         from: 'users', // Assuming your user collection is named 'users'
            //         localField: 'community',
            //         foreignField: '_id',
            //         as: 'communityDetails',
            //     }
            // },
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
        // console.log('agg data', await UserModel.aggregate(aggregationPipeline))

        const [result] = await ArtistsModel.aggregate(aggregationPipeline);

        const paginatedResults = result.paginatedResults || [];
        const totalCount = (result.totalCount && result.totalCount[0] && result.totalCount[0].value) || 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        let communityAdmins = await UserModel.find({ role: 'community_admin' })
        let newData = paginatedResults?.map((item) => {
            return {
                ...item, communityAdmin: communityAdmins?.find((fi) => fi.community == item._id && fi.role == 'community_admin') ? communityAdmins?.find((fi) => fi.community == item._id && fi.role == 'community_admin') : {}
            }

        })

        const data = {
            result: newData,
            paginate: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalResults: totalCount
            }
        }
        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Communities/Hoa data fetched.');



    } catch (error) {

        next(error)
    }

}


export async function editCommunity(req, res, next) {

    try {
        const { communityName, name, email, community, phone, address, dialCode, flag, id } = req.body;
        const communityDataToUpdate = { name: communityName }
        const communityAdminDataToUpdate = { name, email, community, phone, address, dialCode, flag }





        let result = await ArtistsModel.updateOne({ _id: id }, communityDataToUpdate);
        let result2 = await UserModel.updateOne({ community: id, role: "community_admin" }, communityAdminDataToUpdate);


        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'data edited.');




    } catch (error) {
        next(error)
    }

}




export async function toggleCommunityStatus(req, res, next) {

    try {
        const { communityId, status } = req.body;

        let result = await ArtistsModel.updateOne({ _id: communityId }, { isActive: status });
        console.log(result)
        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'status changed.');




    } catch (error) {
        next(error)
    }

}



export async function getArtists(req, res, next) {



    try {
        const result = await ArtistsModel.find({}).select({ name: 1 })


        return HttpResponse.sendAPIResponse(res, result, HTTP_OK, 'Artists Fetched Successfuly.');




    } catch (error) {
        next(error)
    }



}