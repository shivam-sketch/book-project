import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { HTTP_CONFLICT, HTTP_CREATED, HTTP_FORBIDDEN, HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND, HTTP_OK, HTTP_UNAUTHORIZED } from "../../../config/HttpCodes.js";
import HttpResponse from "../../../utils/apiResponses/HttpResponse.js";
import { AuthorizeError, BadRequestError, NotFoundError } from "../../../exceptions/app-exceptions.js";
import { passwordHasher } from "../../../utils/helper.js";
import UserModel from "../../../Model/User.model.js";



export async function register(req, res, next) {

    try {

        const { name,email,password,role } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return HttpResponse.sendAPIResponse(res, {}, HTTP_FORBIDDEN, 'User Already Registered.');
        } else {
           const user = new UserModel({ name,email,password,role });
          let hashedPassword=await passwordHasher(password)
           user.password = hashedPassword
       
           await user.save();
       
           const payload = { user: { id: user._id,email:user.email, role: user.role } };
           const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
            return HttpResponse.sendAPIResponse(res, { _id: user._id, name: user.name, email: user.email,role:user.role,token }, HTTP_CREATED, 'User Signup Successful.');
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
            throw new AuthorizeError("Invalid credentials!");

        }
        


        let hashedPassword = await bcrypt.compare(req.body.password, user.password)

        if (!hashedPassword) {
            throw new AuthorizeError("Invalid credentials!");

        }

        const payload = { user: { id: user._id,email:user.email, role: user.role } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
            return HttpResponse.sendAPIResponse(res,{...payload.user,token}, HTTP_OK, 'User Logged In Successfuly.');

    } catch (error) {
        next(error)
    }




}

