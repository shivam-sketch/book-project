import express from "express";
const router = express.Router();
import * as controller from '../../../../controllers/api/v1/user_app/commonController.js'
import { addNotificationValidation } from "../../../../validations/common.js";
import { validate } from "../../../../middlewares/validate.js";
import verifyToken from "../../../../middlewares/user_app/verifyToken.js";
router.get('/get-community', controller.getCommunity)


// add notifications

router.post('/add-notifications', verifyToken, validate(addNotificationValidation), controller.addNotification)
router.post('/get-notifications', verifyToken,  controller.getNotification)





export default router;
