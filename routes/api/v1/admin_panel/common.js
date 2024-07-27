import express from "express";
const router = express.Router();
import * as controller from '../../../../controllers/api/v1/admin_panel/commonController.js'
import verifyToken from "../../../../middlewares/admin_panel/verifyToken.js";

router.get('/get-community', controller.getCommunity)



router.post("/delete-data", verifyToken, controller.deleteData);




export default router;
