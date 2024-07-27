import { HTTP_BADREQUEST, HTTP_UNPROCESSABLE_ENTITY } from "../config/HttpCodes.js";
import HttpResponse from "../utils/apiResponses/HttpResponse.js";
import { pick } from "../utils/helper.js";
import Joi from "joi";

export const validate = (schema) => (req, res, next) => {

  console.log('req>>>', req.body)

  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {

    // console.log('error', error?.details[0].context)
    const errorMessage = error.details.map((details) => details.message).join(', ')?.replace(/[^a-zA-Z0-9-' ',]/g, '');
    const errorMessageToSend = error.details.map((details) => details.message);

    console.log('validation error is coming', errorMessage)

    return HttpResponse.sendAPIResponse(res, error.details.map((details) => details.message?.replace(/[^a-zA-Z0-9-' ']/g, '')), HTTP_UNPROCESSABLE_ENTITY, errorMessage);

  }
  Object.assign(req, value);
  return next();
};