import { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED } from "../config/HttpCodes.js";
import jwt from "jsonwebtoken";
import HttpResponse from "../utils/apiResponses/HttpResponse.js";

const auth = (roles = []) => {
  return (req, res, next) => {
    if (!req.header("Authorization")) {
      return HttpResponse.sendAPIResponse(
        res,
        {},
        HTTP_UNAUTHORIZED,
        "Access denied, no token provided."
      );
    }
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
        console.log("decode ", decode);
        if (err) {
          return HttpResponse.sendAPIResponse(
            res,
            {},
            HTTP_UNAUTHORIZED,
            "Unauthorize,Token Expired"
          );
        } else {
          // console.log('decode', decode)
          req.user = decode.user;

          if (roles.length && !roles.includes(req.user.role)) {
            return HttpResponse.sendAPIResponse(
              res,
              {},
              HTTP_FORBIDDEN,
              "Sorry! You Are Not Authorized For This Action"
            );
          }

          next();
        }
      });
    }
  };
};

export default auth;
