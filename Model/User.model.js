import mongoose, { Schema } from "mongoose";

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: '',
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Author', 'Reader'], required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['password']
    return ret
  }
})


export default mongoose.model.users || mongoose.model("users", UserSchema);
