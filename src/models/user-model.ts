import { Schema, model } from "mongoose";

export interface IUserModel {
  _id: Schema.Types.ObjectId;
  username: string;
  accessToken: string;
}

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
});

export const User = model("User", userSchema);
