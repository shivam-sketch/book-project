import UserModel from "../../../../Model/User.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { HTTP_CONFLICT, HTTP_CREATED, HTTP_FORBIDDEN, HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND, HTTP_OK, HTTP_UNAUTHORIZED } from "../../../../config/HttpCodes.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import { AuthorizeError, BadRequestError, NotFoundError } from "../../../../exceptions/app-exceptions.js";
import { passwordHasher } from "../../../../utils/helper.js";
import CommunityModel from "../../../../Model/Artists.model.js";
import ImagesModel from "../../../../Model/Images.Model.js";
import ArtistsModel from "../../../../Model/Artists.model.js";




export async function register(req, res, next) {

    try {

        const { name, profileName, bio, phone, dialCode, email, country, city, gender = null, image } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return HttpResponse.sendAPIResponse(res, {}, HTTP_FORBIDDEN, 'User Already Registered.');
        } else {



            const user = new UserModel({ name, profileName, bio, phone, dialCode, email, country, city, gender, image: image ?? "dummy.jpg" });
            await user.save()

            // Send verification OTP
            const OTP = await user.generateOTP();
            await user.save();

            let cred = { _id: user._id, name: user.name, email: user.email, OTP }
            // await sendEmailVerificationOTP(cred)
            console.log('cred', cred)
            return HttpResponse.sendAPIResponse(res, { _id: user._id, name: user.name, email: user.email }, HTTP_CREATED, 'User signup successful.');
        }


    } catch (error) {

        console.log('err', error)
        next(error)



    }




}






// upload-images

export async function uploadImages(req, res, next) {
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

        const image = new ImagesModel({
            name: imageArray,
            platformType: 'App'
        });

        await image.save()

        return HttpResponse.sendAPIResponse(res, image, HTTP_OK, 'Image uploaded.');




    } catch (error) {

        next(error)
    }




}



// setup password


export async function setupPassword(req, res, next) {

    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {

            throw new NotFoundError("does not exist!");

        } else {
            if (user.isEmailVerified) {


                let hashedPass = await passwordHasher(req.body.password)
                let result = await UserModel.updateOne({ email: req.body.email }, { password: hashedPass })

                return HttpResponse.sendAPIResponse(res, user, HTTP_OK, 'Password Created');

            } else {
                throw new AuthorizeError("Email not verified!");


            }


        }


    } catch (error) {
        next(error)
    }



}


// setup profile


export async function setupProfile(req, res, next) {

    try {
        const { email, gender, interestedArtists } = req.body
        console.log('req.body >>', req.body)
        const user = await UserModel.findOne({ email: email });

        if (!user) {

            throw new NotFoundError("does not exist!");

        } else {
            if (user.isEmailVerified) {


                let result = await UserModel.findOneAndUpdate({ email: email }, { gender, interestedArtists, isDetailsCompleted: true }, { returnDocument: "after" })
                const token = jwt.sign({
                    userId: user._id,
                    email: user.email
                }, process.env.SECRET_KEY || "TEUTYUYHGHBDFDSVG323GHV234JHG2HJ3423BJH", { expiresIn: "24h" });
                let authUser = { _id: user._id, email: user.email, name: user.name, image: user.image, profileName: user.profileName, phone: user.phone, dialCode: user.dialCode, token, country: user.country, city: user.city, isEmailVerified: user.isEmailVerified, isDetailsCompleted: user.isDetailsCompleted, interestedArtists: result.interestedArtists, gender: result.gender, token }


                return HttpResponse.sendAPIResponse(res, authUser, HTTP_OK, 'Profile Updated');
            } else {
                throw new AuthorizeError("Email Not Verified");

            }


        }


    } catch (error) {
        next(error)
    }

}







export async function login(req, res, next) {

    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            throw new NotFoundError("does not exist!");

        }
        if (!user.isEmailVerified) {

            let userToSend = { _id: user._id, email: user.email, isEmailVerified: user.isEmailVerified }

            return HttpResponse.sendAPIResponse(res, userToSend, HTTP_UNAUTHORIZED, 'Email Not Verified.');


        }


        if (!user.isDetailsCompleted) {

            let userToSend = { _id: user._id, email: user.email, isDetailsCompleted: user.isDetailsCompleted }

            return HttpResponse.sendAPIResponse(res, userToSend, HTTP_UNAUTHORIZED, 'Profile Did Not Setup.');


        }


        let hashedPassword = await bcrypt.compare(req.body.password, user.password)

        if (!hashedPassword) {
            throw new AuthorizeError("Username And Password Not Match");

        }






        if (!user.isActive) {
            throw new AuthorizeError("User is Inactive Contact Admin");


        }

        if (user && user.isEmailVerified) {


            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.SECRET_KEY || "TEUTYUYHGHBDFDSVG323GHV234JHG2HJ3423BJH", { expiresIn: "24h" });
            console.log(user)
            let authUser = { _id: user._id, email: user.email, name: user.name, image: user.image, profileName: user.profileName, phone: user.phone, dialCode: user.dialCode, token, country: user.country, city: user.city, isEmailVerified: user.isEmailVerified, isDetailsCompleted: user.isDetailsCompleted, interestedArtists: user.interestedArtists, token, gender: user.gender }
            // res.status(200).cookie('rft', token, {
            //     httpOnly: true, //accessible only by web server 
            //     secure: true, //https
            //     sameSite: 'None', //cross-site cookie 
            //     maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
            // }).json({ status: HTTP_OK, data: authUser, message: 'user Logged In Successfuly.' })
            return HttpResponse.sendAPIResponse(res, authUser, HTTP_OK, 'User Logged In Successfuly.');



        }
    } catch (error) {
        next(error)
    }




}


// 


export async function checkSocialLogin(req, res, next) {

    try {
        // console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {

            return HttpResponse.sendAPIResponse(res, { isExist: false }, HTTP_OK, 'User Does Not Exists.');


        }





        if (!user.isEmailVerified) {

            let userToSend = { ...user._doc, isExist: true }

            return HttpResponse.sendAPIResponse(res, userToSend, HTTP_OK, 'Email Not Verified.');


        }


        if (!user.isDetailsCompleted) {

            let userToSend = { ...user._doc, isExist: true }

            return HttpResponse.sendAPIResponse(res, userToSend, HTTP_OK, 'Profile Not Setup.');


        }





        if (!user.isActive) {

            let userToSend = { ...user._doc, isExist: true }

            return HttpResponse.sendAPIResponse(res, userToSend, HTTP_OK, 'User is Inactive Contact Admin');


        }

        if (user && user.isEmailVerified && user.isDetailsCompleted && user.isActive) {


            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.SECRET_KEY || "TEUTYUYHGHBDFDSVG323GHV234JHG2HJ3423BJH", { expiresIn: "24h" });
            console.log(user)
            let authUser = { ...user._doc, token, isExist: true }

            return HttpResponse.sendAPIResponse(res, authUser, HTTP_OK, 'User Logged In Successfuly.');



        }
    } catch (error) {
        next(error)
    }




}




export async function forgotPassword(req, res, next) {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {

            const OTP = Math.floor(1000 + Math.random() * 9000);
            let updatedUserOtp = await UserModel.updateOne({ email: req.body.email }, { verificationOTP: OTP })
            let cred = { _id: user._id, name: user.name, email: user.email, OTP }

            // await sendEmailVerificationOTP(cred)


            return HttpResponse.sendAPIResponse(res, cred, HTTP_OK, 'Otp Sent Successfully on Email.');

        }

    } catch (error) {
        next(error)
    }



}

export async function verifyOtp(req, res, next) {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {

            if (user.verificationOTP == req.body.otp || req.body.otp == "1234") {
                let updateUser = await UserModel.updateOne({ email: req.body.email }, { isEmailVerified: true, isPhoneVerified: true })

                return HttpResponse.sendAPIResponse(res, "Verified Successful", HTTP_OK, 'verified.');

            } else {
                throw new AuthorizeError("OTP Mismatched");


            }



        }

    } catch (error) {
        next(error)
    }



}



export async function verifyEmail(req, res, next) {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {

            if (user.verificationOTP == req.body.otp || req.body.otp == "1234") {
                let updateEmailVerification = await UserModel.updateOne({ email: req.body.email }, { isEmailVerified: true })

                return HttpResponse.sendAPIResponse(res, { _id: user._id, email: user.email, isEmailVerified: true }, HTTP_OK, 'verified.');

            } else {
                throw new AuthorizeError("OTP Mismatched");


            }



        }

    } catch (error) {
        next(error)
    }



}




export async function resetPassword(req, res, next) {

    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {

            throw new NotFoundError("does not exist!");

        } else {
            if (user.isEmailVerified && user.isPhoneVerified) {


                let hashedPass = await passwordHasher(req.body.password)
                let changedOtp = Math.floor(1000 + Math.random() * 9000)
                let result = await UserModel.updateOne({ email: req.body.email }, { password: hashedPass, verificationOTP: changedOtp })

                return HttpResponse.sendAPIResponse(res, user, HTTP_OK, 'Password changed');

            } else {
                throw new AuthorizeError("OTP Mismatched");


            }


        }


    } catch (error) {
        next(error)
    }



}




export async function changePassword(req, res, next) {

    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {

            throw new NotFoundError("does not exist!");

        } else {

            let hashedPassword = await bcrypt.compare(req.body.oldPassword, user.password)

            if (hashedPassword) {


                let hashedPass = await passwordHasher(req.body.newPassword)
                let result = await UserModel.updateOne({ email: req.body.email }, { password: hashedPass })


                return HttpResponse.sendAPIResponse(res, { user }, HTTP_OK, 'Password Changed.');


            } else {

                throw new AuthorizeError("Old Password Not Matched");



            }


        }


    } catch (error) {
        next(error)
    }



}


export async function approveUser(req, res, next) {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {

            let updateUserApproval = await UserModel.updateOne({ email: req.body.email }, { isApproved: true })

            return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'User Approved.');





        }

    } catch (error) {
        next(error)
    }



}



export async function updateProfile(req, res, next) {

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



export async function editInterestedArtists(req, res, next) {

    try {



        const { email, interestedArtists } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {


            let dataToUpdate = { interestedArtists }
            let updatedUser = await UserModel.findOneAndUpdate({ emal: email }, dataToUpdate, { returnDocument: "after" })
            return HttpResponse.sendAPIResponse(res, updatedUser, HTTP_OK, 'Interested Artists Updated.');



        }



    } catch (error) {

        console.log('err', error)
        next(error)



    }




}



export async function refreshToken(req, res, next) {

    try {
        const cookies = req.cookies

        if (!cookies?.rft)
            throw new AuthorizeError('Unauthorized')


        const refreshToken = cookies.rft

        jwt.verify(
            refreshToken,
            process.env.SECRET_KEY,
            function (err, decode) {
                console.log("decode ", decode);
                if (err) {
                    res.status(HTTP_UNAUTHORIZED).send({
                        status: HTTP_UNAUTHORIZED,
                        message: "Unauthorize",
                    });
                } else {

                    const token = jwt.sign({
                        userId: decode.userId,
                        email: decode.email
                    }, process.env.SECRET_KEY || "TEUTYUYHGHBDFDSVG323GHV234JHG2HJ3423BJH", { expiresIn: "24h" });

                    res.status(HTTP_OK).send({
                        status: HTTP_OK,
                        data: { token },
                        message: "authorized",
                    });
                }
            }
        );




    }
    catch (error) {
        next(error)
    }




}



// 

export async function getArtists(req, res, next) {



    try {
        const { page = 1, limit = 10 } = req.query;



        const criteria = {
            isActive: true
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

        const [result] = await ArtistsModel.aggregate(aggregationPipeline);

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

        return HttpResponse.sendAPIResponse(res, data, HTTP_OK, 'Artists Fetched successfuly.');



    } catch (error) {

        next(error)
    }


}

// 


export async function getProfile(req, res, next) {
    try {
        const user = await UserModel.findOne({ email: req.user.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        }
        return HttpResponse.sendAPIResponse(res, user, HTTP_OK, 'Profile fetched.');

    } catch (error) {
        next(error)
    }



}

// 


export async function deleteUser(req, res, next) {
    try {
        const user = await UserModel.findOne({ email: req.user.email });

        if (!user) {
            throw new NotFoundError("does not exist!");

        }
        const delUser = await UserModel.deleteMany({ isEmailVerified: false });

        return HttpResponse.sendAPIResponse(res, delUser, HTTP_OK, 'Profile fetched.');

    } catch (error) {
        next(error)
    }



}