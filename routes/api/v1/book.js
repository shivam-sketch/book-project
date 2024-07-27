import express from "express";
const router = express.Router();
import * as controller from "../../../controllers/api/v1/bookController.js";
import { validate } from "../../../middlewares/validate.js";
import { upload } from "../../../utils/multer.js";
import {
  addBookValidation,
  deleteBookValidation,
  updateBookValidation,
} from "../../../validations/joi.js";

router
  .route("/")
  .post(
    upload.single("coverPage"),
    validate(addBookValidation),
    controller.addBook
  )
  .get(controller.getBook)
  .put(
    upload.single("coverPage"),
    validate(updateBookValidation),
    controller.updateBook
  )
  .delete(validate(deleteBookValidation), controller.deleteBook);

// router.post("/login", validate(loginUserValidation),controller.login);

export default router;
