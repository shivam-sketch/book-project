import express from "express";
const router = express.Router()
import * as controller from '../../../../controllers/api/v1/admin_panel/webController.js'
import verifyToken from "../../../../middlewares/admin_panel/verifyToken.js"
import { addUsersValidation, editUsersValidation, getUserValidation, registerUserValidation, toggleUserStatusValidation } from "../../../../validations/admin_panel/users.js";
import { validate } from "../../../../middlewares/validate.js";
import { addDialCodesValidation, addPrivacyPolicyValidation, addTermsAndConditionsValidations, editPrivacyPolicyValidation, editTermsAndConditionsValidation } from "../../../../validations/admin_panel/support.js";
import { addAnnouncementsValidations } from "../../../../validations/admin_panel/Announcements.js";
import { toggleCommunityStatusValidation } from "../../../../validations/admin_panel/community.js";
import { addEventsValidation, addMusicsValidation } from "../../../../validations/admin_panel/web.js";
import { upload } from "../../../../utils/multer.js";




router.post("/add-user", verifyToken, validate(addUsersValidation), controller.register);

router.post("/get-users", verifyToken, validate(getUserValidation), controller.getUsers);
router.post("/edit-users", verifyToken, validate(editUsersValidation), controller.editUsers);

router.post("/toggle-user-status", verifyToken, validate(toggleUserStatusValidation), controller.toggleUserStatus);
router.post("/toggle-user-approval-status", verifyToken, validate(toggleUserStatusValidation), controller.toggleUserApprovalStatus);


router.post("/add-artists", controller.addArtists);
router.post("/add-events", validate(addEventsValidation), controller.addEvents);
router.post("/add-music", validate(addMusicsValidation), controller.addMusics);
router.post("/add-featured", upload.any(), controller.addFeatured);
router.post('/get-events', verifyToken, controller.getEvents)
router.get('/get-artists', verifyToken, controller.getArtists)



router.post("/edit-community", verifyToken, controller.editCommunity);


router.post("/get-communities", verifyToken, controller.getCommunities);

router.post("/toggle-community-status", verifyToken, validate(toggleCommunityStatusValidation), controller.toggleCommunityStatus);



// about-us

router.post('/add-about-us', controller.addAboutUs)
router.get('/about-us', verifyToken, controller.getAboutUs)

// privacy-policy
router.get('/privacy-policy', verifyToken, controller.getPrivacyPolicy)
router.post('/add-privacy-policy', validate(addPrivacyPolicyValidation), controller.addPrivacyPolicy)
router.post('/edit-privacy-policy', verifyToken, validate(editPrivacyPolicyValidation), controller.editPrivacyPolicy)
router.post('/delete-privacy-policy', verifyToken, controller.deletePrivacyPolicy)
router.post('/toggle-privacy-policy', verifyToken, controller.togglePrivacyPolicy)




// terms and conditions
router.get('/terms-and-conditions', verifyToken, controller.getTermsAndCondition)
router.post('/add-terms-and-conditions', validate(addTermsAndConditionsValidations), controller.addTermsAndCondition)
router.post('/edit-terms-and-conditions', verifyToken, validate(editTermsAndConditionsValidation), controller.editTermsAndConditions)
router.post('/delete-terms-and-conditions', verifyToken, controller.deleteTermsAndConditions)
router.post('/toggle-terms-and-conditions', verifyToken, controller.toggleTermsAndConditions)

// Faq

router.post('/add-faq', validate(addTermsAndConditionsValidations), controller.addFaq)


// get-tickets
router.get('/get-user-tickets', verifyToken, controller.getUserTickets)
router.get('/get-community-tickets', verifyToken, controller.getCommunityTickets)




// get helpdesk



// add global announcements

router.post('/add-global-announcements', verifyToken, validate(addAnnouncementsValidations), controller.addGlobalAnnouncements)

router.get('/get-global-announcements', verifyToken, controller.getGlobalAnnouncements)





export default router;
