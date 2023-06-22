import { Schema, model } from "mongoose";

export interface IInstaMediaModel {
  _id: Schema.Types.ObjectId;
  postUrl: string;
  mediaUrl: string;
  instaId:string;
  caption?:string;
  hashtags:string[]
}

const instaMediaSchema = new Schema({
  postUrl: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  instaId: {
    type: String,
    required: true,
    unique:true
  },
  caption: {
    type: String,
    // required: true,
  },
  hashtags: {
    type: [String],
    // required: true,
  },
  publishedAt:{
    type:Date,
    required:true
  }
});

export const InstaMedia = model("InstaMedia", instaMediaSchema);
