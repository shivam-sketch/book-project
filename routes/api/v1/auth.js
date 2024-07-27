import express from "express";
const router = express.Router();
import * as controller from "../../../controllers/api/v1/authController.js"
import { validate } from "../../../middlewares/validate.js";
import { loginUserValidation, registerUserValidation } from "../../../validations/joi.js";

router.post('/register',validate(registerUserValidation), controller.register)

router.post("/login", validate(loginUserValidation),controller.login);

export default router;
