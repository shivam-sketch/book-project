import express from "express";
const router = express.Router();
import * as controller from '../../../../controllers/api/v1/user_app/postsController.js'
import verifyToken from "../../../../middlewares/user_app/verifyToken.js";
import { addPostValidation, addReportValidation, commentLikeValidation, postCommentValidation, postLikeValidation } from "../../../../validations/user_app/posts.js";
import { validate } from "../../../../middlewares/validate.js";
import multer from "multer";
import { upload } from "../../../../utils/multer.js";

router.post('/add-posts', verifyToken, validate(addPostValidation), controller.addPosts)
router.post('/get-all-posts', verifyToken, controller.getPosts)
router.post('/get-sell-categories', verifyToken, controller.getSellCategories)

router.post('/upload-post-images', verifyToken, upload.any(), controller.uploadPostImages)
router.post('/like-post', verifyToken, validate(postLikeValidation), controller.likePost)

router.post('/post-comment', verifyToken, validate(postCommentValidation), controller.postComment)
router.post('/like-comment', verifyToken, validate(commentLikeValidation), controller.likeComment)

// share post api
router.post('/share-post', verifyToken, controller.sharePost)





// types of violations
router.get('/types-of-reports', verifyToken, controller.getReportTypes)
// add violation
router.post('/add-report', verifyToken, validate(addReportValidation), controller.addReport)










export default router;
