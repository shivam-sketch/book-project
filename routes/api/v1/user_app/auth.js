import express from "express";
const router = express.Router();
import { changePasswordValidation, checkSocialLoginValidation, editInterestedArtistValidation, loginUserValidation, registerUserValidation, resetPasswordValidation, setupPasswordValidation, setupProfileValidation, updateProfileValidation } from "../../../../validations/user_app/users.js";
import * as controller from '../../../../controllers/api/v1/user_app/authController.js'
import { validate } from "../../../../middlewares/validate.js";
import verifyToken from "../../../../middlewares/user_app/verifyToken.js";
import { upload } from "../../../../utils/multer.js";





router.post('/upload-images', upload.any(), controller.uploadImages)
router.post("/setup-password", validate(setupPasswordValidation), controller.setupPassword);
router.post("/setup-profile", validate(setupProfileValidation), controller.setupProfile);
router.post("/refresh", controller.refreshToken);

router.post('/register', validate(registerUserValidation), controller.register)

router.post("/login", validate(loginUserValidation), controller.login);
router.post("/check-social-login", validate(checkSocialLoginValidation), controller.checkSocialLogin);

router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/verify-email", controller.verifyEmail);

router.post("/reset-password", validate(resetPasswordValidation), controller.resetPassword);
router.post("/change-password", verifyToken, validate(changePasswordValidation), controller.changePassword);
router.post("/edit-interested-artists", verifyToken, validate(editInterestedArtistValidation), controller.editInterestedArtists);

router.post("/profile", verifyToken, validate(updateProfileValidation), controller.updateProfile);
router.get("/get-profile", verifyToken, controller.getProfile);
router.get("/delete-user", verifyToken, controller.deleteUser);


router.post("/approve-user", controller.approveUser);
router.get("/get-artists", controller.getArtists);







export default router;
