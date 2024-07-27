import mongoose from "mongoose";

const booksSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverPage: { type: String, required: true },
    year: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model.books || mongoose.model("books", booksSchema);
