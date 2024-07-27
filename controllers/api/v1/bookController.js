import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK,
  HTTP_UNAUTHORIZED,
} from "../../../config/HttpCodes.js";
import HttpResponse from "../../../utils/apiResponses/HttpResponse.js";
import {
  AuthorizeError,
  BadRequestError,
  NotFoundError,
} from "../../../exceptions/app-exceptions.js";
import { passwordHasher } from "../../../utils/helper.js";
import UserModel from "../../../Model/User.model.js";
import BooksModel from "../../../Model/Books.model.js";

export async function addBook(req, res, next) {
  try {
    if (!req.file) {
      throw new BadRequestError("Upload Cover Image");
    }
    req.body.coverPage = req.file.filename;
    const book = new BooksModel(req.body);
    await book.save();
    return HttpResponse.sendAPIResponse(
      res,
      book,
      HTTP_CREATED,
      "Book Added Successful."
    );
  } catch (error) {
    console.log("err", error);
    next(error);
  }
}

export async function updateBook(req, res, next) {
  try {
    const { id, ...body } = req.body;
    if (req.file) {
      body["coverPage"] = req.file.filename;
    }
    const book = await BooksModel.updateOne({ _id: id }, body);
    return HttpResponse.sendAPIResponse(
      res,
      {},
      HTTP_OK,
      "Book Updated Successful."
    );
  } catch (error) {
    console.log("err", error);
    next(error);
  }
}

export async function getBook(req, res, next) {
  try {
    const books = await BooksModel.find({ isDeleted: false });

    return HttpResponse.sendAPIResponse(
      res,
      books,
      HTTP_CREATED,
      "Books Fetched Successfuly."
    );
  } catch (error) {
    console.log("err", error);
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const { id } = req.body;

    const book = await BooksModel.updateOne({ _id: id }, { isDeleted: true });
    return HttpResponse.sendAPIResponse(
      res,
      {},
      HTTP_OK,
      "Book Deleted Successfuly"
    );
  } catch (error) {
    console.log("err", error);
    next(error);
  }
}
