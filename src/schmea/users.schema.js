import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    chatId: {
      type: Number,
      required: true,
    },
    phone_number: {
      type: String,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    action: String,
    status: {
      type: Boolean,
      default: true,
    },
    createdAt: Date,
  },
  {
    versionKey: false,
  }
);

const Users = model("Users", userSchema);
export default Users;
