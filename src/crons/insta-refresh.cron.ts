import { User } from "../models/user-model";
import fetch from "cross-fetch";
export async function instaRefresh() {
  try {
    const user = await User.findOne({ username: process.env.INSTA_USER_NAME });
    if (!user) {
      return;
      //   const error = new Error("User not found");
      //   throw error;
    }
    let oldAccessToken = user.accessToken; // get from DB
    let response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldAccessToken}`
    );
    const data = await response.json();
    if (data.access_token) {
      let newAccessToken = data.access_token;
      user.accessToken = newAccessToken;
      await user.save();
      // save newAccessToken to DB
    }
  } catch (error) {
    console.log("Error=====", error);
    return Promise.reject(error);
  }
}
