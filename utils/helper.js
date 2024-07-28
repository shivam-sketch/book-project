import bcrypt from "bcrypt";
import { ValidationError } from "../exceptions/app-exceptions.js";

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

// check is valid password
const isValidPassword = (value, helpers) => {
  console.log("valueeeeeeeeeeeeeeee", value);

  if (
    value.length < 8 ||
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[!@#$%^&*()\-=_+{};':",.<>/?[\]\\|]/.test(value)
  ) {
    return helpers.message(
      "Password must include atleast one lowercase letter, one uppercase letter, one number and one special character and must be atleast 8 characters long"
    );
  }
  return value;
};

// Check is valid object id
const isValidObjectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const emailValidator = (value) => {
  return value;
};

const passwordHasher = async (password, saltRound = 10) => {
  try {
    let hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
  } catch (error) {
    throw new ValidationError("password not hashed!");
  }
};

async function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  return retVal + "@";
}

export {
  pick,
  isValidPassword,
  isValidObjectId,
  emailValidator,
  passwordHasher,
  generatePassword,
};
