import express from "express";
const router = express.Router();
import { validate } from "../../../../middlewares/validate.js";
import { loginUserValidation, registerUserValidation, resetPasswordValidation } from "../../../../validations/admin_panel/users.js";
import * as controller from '../../../../controllers/api/v1/admin_panel/authController.js'



router.post("/register", validate(registerUserValidation), controller.register);

router.post("/login", validate(loginUserValidation), controller.login);
router.post("/forgot-password", controller.forgotPassword)
router.post("/reset-password", validate(resetPasswordValidation), controller.resetPassword);
router.post("/refresh", controller.refreshToken);
router.post("/log-out", controller.logOut);



export default router;
