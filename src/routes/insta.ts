import express from "express";
import querystring from "querystring";
import fetch from "cross-fetch";
import { User } from "../models/user-model";
import { InstaMedia } from "../models/insta-media-model";
import { getUserMedia } from "../crons/insta-cache-cron";
const router = express.Router();

async function getShortlivedAccessToken(code: string) {
  try {
    const url = "https://api.instagram.com/oauth/access_token";
    const body = querystring.stringify({
      client_id: process.env.INSTA_APP_ID,
      client_secret: process.env.INSTA_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.INSTA_REDIRECT_URI,
      code: code,
    });

    const response = await fetch(url, {
      body: body,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
    
      return Promise.reject(
        "getShortlivedAccessToken: There was a problem loggin in,try again later"
      );
    }
    const data = await response.json();

    if (data.error_message) {
    
      return Promise.reject(`getShortlivedAccessToken: ${data.error_message}`);
    }
    return data.access_token;
  } catch (error) {
    console.log(error, "ERROR");
    Promise.reject(error);
  }
}

async function getLongLivedAccessToken(accessToken: string) {
  try {
    let response = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTA_APP_SECRET}&access_token=${accessToken}`
    );
    // if(!response.ok){
    //   return Promise.reject('getLongLivedAccessToken: There was a problem loggin in, try again later')
    // }
    const data = await response.json();

    if (data.error) {
      return Promise.reject(
        data.error && data.error.message
          ? `getLongLivedAccessToken:${data.error.message}`
          : "getLongLivedAccessToken: There was a problem loggin in, try again later"
      );
    }
    return data.access_token;
  } catch (error) {
    Promise.reject(error);
  }
}

async function getUserInfo(accessToken: string) {
  try {
    if (!accessToken) {
      return Promise.reject("There was a problem getting user info,try again");
    }
    let response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    if (!response.ok) {
      return Promise.reject(
        "getUserInfo: There was a problem getting user info,try again"
      );
    }
    return response.json();
  } catch (error) {
    return Promise.reject(error);
  }
}

// async function getUserMedia(accessToken: string) {
//   try {
//     if (!accessToken) {
//       return Promise.reject("getUserMedia: Unable to get user media");
//     }
//     let response = await fetch(
//       `https://graph.instagram.com/me/media?fields=media_type,permalink,media_url,caption,timestamp&access_token=${accessToken}`
//     );

//     const data = await response.json();
//     if (!response.ok || data.error) {
//       return Promise.reject(
//         data.error && data.error.message
//           ? `getUserMedia: ${data.error.message}`
//           : "getUserMedia: There was a problem fetching posts,try again later"
//       );
//     }

//     const formattedData = data.data.map((media: any) => {
//       return {
//         postUrl:media.permalink,
//         mediaUrl:media.media_url,
//         instaId:media.id,
//         caption:media.caption,
//         hashtags: media.caption.match(/#\w+/g),
//         publishedAt:media.timestamp
//       };
//     });
//     await InstaMedia.insertMany(formattedData);

//     return formattedData;

//     // Got insta photos
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

async function createUser(
  instaUser: { id: string; username: string },
  accessToken: string
) {
  try {
    const { username, id } = instaUser;

    const user = await User.findOneAndUpdate(
      { username },
      { username, accessToken },
      {
        new: true,
        upsert: true,
      }
    );

    // const user = new User();

    // user.username = username;
    // user.accessToken = accessToken;
    // await user.save()
    return user;
  } catch (error) {
    Promise.reject(error);
  }
}

router.post("/login", async (req, res, next) => {
  try {
    const accessToken = await getShortlivedAccessToken(req.body.code);
    if (!accessToken) {
      const error = new Error("Unable to login");
      return next(error);
    }

    let longLivedAccessToken = await getLongLivedAccessToken(accessToken);
    let user;

    if (!longLivedAccessToken) {
      user = await User.findOne({ username: process.env.INSTA_USER_NAME! });
      longLivedAccessToken = user?.accessToken;
    } else if (!user) {
      user = await getUserInfo(longLivedAccessToken);
      await createUser(user, longLivedAccessToken);
    }
    if (longLivedAccessToken) {
      await getUserMedia(longLivedAccessToken);
    }

    res.send({ message: "Logged in successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/posts", async (req, res, next) => {
  try {
    const { limit = 1000, page = 1 } = req.query;
    const posts = await InstaMedia.find()
      .skip((+page - 1) * +limit)
      .limit(+limit);
    res.send({message:'success',posts})
  } catch (error) {
    next(error);
  }
});

export default router;

// Todo
// 1) setup token refresh service:https://javascript.plainenglish.io/instagram-basic-display-api-integration-with-nodejs-45e4338dff17
// This will require access token to be stored
// 2) setup cron job to fetch new posts
// 3) create a button on FE to fetch new posts;
