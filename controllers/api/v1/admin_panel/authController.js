import UserModel from "../../../../Model/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import { HTTP_CONFLICT, HTTP_CREATED, HTTP_FORBIDDEN, HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND, HTTP_OK, HTTP_UNAUTHORIZED } from "../../../../config/HttpCodes.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import { AuthorizeError, NotFoundError, ValidationError } from "../../../../exceptions/app-exceptions.js";
import { passwordHasher } from "../../../../utils/helper.js";


export async function register(req, res, next) {

    try {

        const existingUser = await UserModel.findOne({ email: req.body.email, role: 'super_admin' });
        console.log(existingUser)
        if (existingUser) {
            return res.status(HTTP_CONFLICT).json({ status: HTTP_CONFLICT, message: 'User Already Registered', data: {} })
        } else {

            let hashedPassword = await passwordHasher(req.body.password)
            const user = new UserModel({ name: req.body.name, email: req.body.email, password: hashedPassword, role: req.body.role });
            await user.save()
            let cred = { _id: user._id, name: user.name, email: user.email, role: user.role }
            return HttpResponse.sendAPIResponse(res, cred, HTTP_CREATED, 'User signup successful.');
        }

    } catch (error) {

        console.log('err', error)

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


            const rft = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.SECRET_KEY, { expiresIn: "24h" });

            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.SECRET_KEY, { expiresIn: "5m" });
            console.log(user)
            let authUser = { _id: user._id, email: user.email, name: user.name, image: user.image, profileName: user.profileName, phone: user.phone, dialCode: user.dialCode, token, country: user.country, city: user.city, isEmailVerified: user.isEmailVerified, isDetailsCompleted: user.isDetailsCompleted, interestedArtists: user.interestedArtists, token, gender: user.gender }
            res.status(200).cookie('rft', rft, {
                httpOnly: true, //accessible only by web server 
                secure: true, //https
                sameSite: 'None',
                maxAge: 1 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
            }).json({ status: HTTP_OK, data: authUser, message: 'user Logged In Successfuly.' })
            // return HttpResponse.sendAPIResponse(res, authUser, HTTP_OK, 'User Logged In Successfuly.');



        }
    } catch (error) {
        next(error)
    }




}


export async function forgotPassword(req, res, next) {
    try {
        console.log(req.body);
        const user = await UserModel.findOne({ email: req.body.email, role: "super_admin" });

        if (!user) {
            throw new NotFoundError("does not exist!");

        } else {




            return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Email Verified.');

        }

    } catch (error) {
        next(error)
    }



}


/**
 * Reset password API
 * @param {*} req 
 * @param {*} res 
 * @returns {}
 */
export async function resetPassword(req, res, next) {

    try {
        let hashedPass = await passwordHasher(req.body.password)
        let result = await UserModel.updateOne({ email: req.body.email }, { password: hashedPass });
        return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Password changed.');


    } catch (error) {
        next(error)
    }

}




// refresh token


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
                console.log("decode rft", decode);
                if (err) {
                    return HttpResponse.sendAPIResponse(res, {}, HTTP_FORBIDDEN, 'Unauthorized!');

                } else {

                    const token = jwt.sign({
                        userId: decode.userId,
                        email: decode.email
                    }, process.env.SECRET_KEY, { expiresIn: "5m" });

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


export async function logOut(req, res, next) {

    try {


        res.clearCookie('rft', { httpOnly: true, sameSite: 'None', secure: false })
        return HttpResponse.sendAPIResponse(res, {}, HTTP_OK, 'Admin Logged Out!');


    }
    catch (error) {
        next(error)
    }




}