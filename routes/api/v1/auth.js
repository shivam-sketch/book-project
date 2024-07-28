import express from "express";
const router = express.Router();
import * as controller from "../../../controllers/api/v1/authController.js";
import { validate } from "../../../middlewares/validate.js";
import {
  loginUserValidation,
  registerUserValidation,
} from "../../../validations/joi.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - role
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           default: "sstest2@yopmail.com"
 *         password:
 *           type: string
 *           default: "123456"
 *         name:
 *           type: string
 *           default: "sometest"
 *         role:
 *           type: string
 *           default: "Admin"
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 default: "sstest1@yopmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 default: "12345"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post("/register", validate(registerUserValidation), controller.register);

router.post("/login", validate(loginUserValidation), controller.login);

export default router;
