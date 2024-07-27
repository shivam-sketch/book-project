import AboutUsModel from "../../../../Model/AboutUs.Model.js";
import FaqModel from "../../../../Model/Faq.model.js";
import PrivacyPolicyModel from "../../../../Model/PrivacyPolicy.Model.js";
import TermsAndConditionModel from "../../../../Model/TermsAndCondition.model.js";
import TicketsModel from "../../../../Model/Tickets.Model.js";
import { HTTP_CREATED, HTTP_OK } from "../../../../config/HttpCodes.js";
import HttpResponse from "../../../../utils/apiResponses/HttpResponse.js";
import { emailValidator } from "../../../../utils/helper.js";


// about us controllers






export async function getAboutUs(req, res, next) {



    try {
        const aboutUs = await AboutUsModel.find({ isActive: true }, { about: 1 })


        return HttpResponse.sendAPIResponse(res, aboutUs, HTTP_OK, 'Adbout Us Fetched Successfuly.');




    } catch (error) {
        next(error)
    }













}




// Privacy Policy controllers






export async function getPrivacyPolicy(req, res, next) {



    try {
        const privacyPolicy = await PrivacyPolicyModel.find({ isActive: true }).select({ title: 1, description: 1 })


        return HttpResponse.sendAPIResponse(res, privacyPolicy, HTTP_OK, 'Privacy Policy Fetched Successfuly.');




    } catch (error) {
        next(error)
    }

}


// terms_and_condition







export async function getTermsAndCondition(req, res, next) {



    try {
        const termsAndCondition = await TermsAndConditionModel.find({ isActive: true }).select({ title: 1, description: 1 })


        return HttpResponse.sendAPIResponse(res, termsAndCondition, HTTP_OK, 'Terms and Conditions Fetched Successfuly.');




    } catch (error) {
        next(error)
    }

}

// 


export async function getFaq(req, res, next) {



    try {
        const faq = await FaqModel.find({ isActive: true }).select({ title: 1, description: 1 })


        return HttpResponse.sendAPIResponse(res, faq, HTTP_OK, 'Terms and Conditions Fetched Successfuly.');




    } catch (error) {
        next(error)
    }

}






//add tickets api



export async function addTickets(req, res, next) {

    try {

        const { userInfo, subject, description } = req.body;
        let validUserInfo = emailValidator(userInfo)
        const newTickets = new TicketsModel({ userInfo: validUserInfo, subject, description, helpType: "user" })
        await newTickets.save()



        return HttpResponse.sendAPIResponse(res, newTickets, HTTP_OK, 'New Ticket Added.');




    } catch (error) {

        console.log('err', error)

        next(error)

    }




}




