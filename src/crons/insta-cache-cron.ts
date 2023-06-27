import { IInstaMediaModel, InstaMedia } from "../models/insta-media-model";
import { User } from "../models/user-model";

// Instead of recurssion use this:
// async function getAllPosts(accessToken) {
//   let allPosts = [];
//   let nextUrl = `https://graph.instagram.com/me/media?fields=id,caption&access_token=${accessToken}`;

//   while (nextUrl) {
//     const response = await fetch(nextUrl);
//     const data = await response.json();

//     allPosts = allPosts.concat(data.data);
//     nextUrl = data.paging.next;
//   }

//   return allPosts;
// }

export async function getUserMedia(accessToken?: string) {
  try {
    let storedAccessToken = accessToken;
    let allPosts: IInstaMediaModel[] = [];
    if (!accessToken) {
      const user = await User.findOne({
        username: process.env.INSTA_USER_NAME,
      });
      if (!user) {
        return Promise.reject("getUserMedia: Unable to get user media");
      }
      storedAccessToken = user?.accessToken;
    }

    let nextUrl = `https://graph.instagram.com/me/media?fields=media_type,permalink,media_url,caption,timestamp&access_token=${storedAccessToken}&limit=1000`;

    while (nextUrl) {
      let response = await fetch(nextUrl);

      const data = await response.json();
      if (!response.ok || data.error) {
        return Promise.reject(
          data.error && data.error.message
            ? `getUserMedia: ${data.error.message}`
            : "getUserMedia: There was a problem fetching posts,try again later"
        );
      }

      allPosts = allPosts.concat(data.data);
      nextUrl = data.paging ? data.paging.next : undefined;
    }

    const formattedData = allPosts.map((media: any) => {
      return {
        postUrl: media.permalink,
        mediaUrl: media.media_url,
        instaId: media.id,
        caption: media.caption ? media.caption : "",
        hashtags: media.caption ? media.caption.match(/#\w+/g) : [],
        publishedAt: media.timestamp,
      };
    });
    await InstaMedia.deleteMany({})
    await InstaMedia.insertMany(formattedData);

    return formattedData;


  } catch (error) {
    return Promise.reject(error);
  }
}
