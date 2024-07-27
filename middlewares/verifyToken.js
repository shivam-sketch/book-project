import { HTTP_UNAUTHORIZED } from "../../config/HttpCodes.js";
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    if (req?.headers && req?.headers?.authorization) {
        jwt.verify(
            req.headers.authorization,
            process.env.SECRET_KEY,
            function (err, decode) {
                console.log("decode ", decode);
                if (err) {
                    res.status(HTTP_UNAUTHORIZED).send({
                        status: HTTP_UNAUTHORIZED,
                        data: {},
                        message: "Unauthorize",
                    });
                } else {
                    // console.log('decode', decode)
                    req.user = decode;
                    next();
                }
            }
        );
    } else {
        res.status(HTTP_UNAUTHORIZED).send({
            status: HTTP_UNAUTHORIZED,
            data: {},
            message: "Unauthorize",
        });

    }
};

export default verifyToken