import mongoose from "mongoose";
import ENV from "../config/config.js"
async function connect() {
  mongoose.set("strictQuery", true);
let uri=process.env.MONGODB_URI ?? ENV.ATLAS_URI
  const db = await mongoose.connect(uri);

  console.log("database connected");
  return db;
}

export default connect;
