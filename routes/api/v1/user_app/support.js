import express from "express";
const router = express.Router();
import * as controller from '../../../../controllers/api/v1/user_app/supportController.js'
import verifyToken from "../../../../middlewares/user_app/verifyToken.js";
import { validate } from "../../../../middlewares/validate.js";
import { addTicketsValidations } from "../../../../validations/user_app/support.js";

// about us

router.get('/about-us', verifyToken, controller.getAboutUs)

// privacy policy

router.get('/privacy-policy', verifyToken, controller.getPrivacyPolicy)


// terms and conditions
router.get('/terms-and-conditions', verifyToken, controller.getTermsAndCondition)

// faq

router.get('/faq', verifyToken, controller.getFaq)




// add tickets
router.post('/add-tickets', verifyToken, validate(addTicketsValidations), controller.addTickets)



export default router;
