import express from "express";
const router = express.Router();
import * as controller from '../../../../controllers/api/v1/user_app/HomeController.js'
import verifyToken from "../../../../middlewares/user_app/verifyToken.js";
import { validate } from "../../../../middlewares/validate.js";


router.post('/get-musics', verifyToken, controller.getMusics)
router.post('/get-events', verifyToken, controller.getEvents)
router.post('/get-featured', verifyToken, controller.getFeatured)
router.post('/event-interested', verifyToken, controller.interestedPost)

router.post("/interested-events", verifyToken, controller.interestedEvents);



export default router;
