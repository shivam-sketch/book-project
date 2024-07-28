import express from "express";
const router = express.Router();
import * as controller from "../../../controllers/api/v1/bookController.js";
import { validate } from "../../../middlewares/validate.js";
import auth from "../../../middlewares/verifyToken.js";
import { upload } from "../../../utils/multer.js";
import {
  addBookValidation,
  deleteBookValidation,
  updateBookValidation,
} from "../../../validations/joi.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - coverPage
 *         - year
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         coverPage:
 *           type: string
 *         year:
 *           type: integer
 *           format: int64
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

/**
 * @swagger
 * /api/v1/book:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               coverPage:
 *                 type: string
 *                 format: binary
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The book was successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/book:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/book:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               coverPage:
 *                 type: string
 *                 format: binary
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The book was successfully updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/book:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: The book was successfully deleted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router
  .route("/")
  .post(
    auth(["Admin", "Author"]),
    upload.single("coverPage"),
    validate(addBookValidation),
    controller.addBook
  )
  .get(auth(["Admin", "Author", "Reader"]), controller.getBook)
  .put(
    auth(["Admin", "Author"]),
    upload.single("coverPage"),
    validate(updateBookValidation),
    controller.updateBook
  )
  .delete(
    auth(["Admin"]),
    validate(deleteBookValidation),
    controller.deleteBook
  );

// router.post("/login", validate(loginUserValidation),controller.login);

export default router;
