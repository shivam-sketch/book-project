import {
  HTTP_BADREQUEST,
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_UNAUTHORIZED,
  HTTP_UNPROCESSABLE_ENTITY,
} from "../config/HttpCodes.js";
import HttpResponse from "../utils/apiResponses/HttpResponse.js";

class HttpExceptionHandler {
  handler(err, req, res, next) {
    let statusCode = err.statusCode || HTTP_INTERNAL_SERVER_ERROR;
    let message = err.message;

    switch (statusCode) {
      case HTTP_UNAUTHORIZED:
        message = message || "Unauthenticated";
        break;

      case HTTP_FORBIDDEN:
        message = message || "Forbidden";
        break;

      case HTTP_NOT_FOUND:
        message = message || "Not found";
        break;

      case HTTP_METHOD_NOT_ALLOWED:
        message = message || "Method Not Allowed";
        break;

      case HTTP_UNPROCESSABLE_ENTITY:
        message = message || "Unprocessable entity";
        break;

      case HTTP_INTERNAL_SERVER_ERROR:
        message = message;
        break;

      case HTTP_BADREQUEST:
        message = message;
        break;
      default:
        message = "Internal Server Error";
        break;
    }
    return HttpResponse.sendAPIResponse(res, {}, statusCode, message);
  }
  
  //   validation(req, res, next) {
  //     let errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       let message = "Unprocessable entity.";
  //       return HttpResponse.sendAPIResponse(
  //         res,
  //         errors.array(),
  //         HttpCodes.HTTP_UNPROCESSABLE_ENTITY,
  //         message
  //       );
  //     }
  //     next();
  //   }
}

export default new HttpExceptionHandler();
