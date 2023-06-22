import { app } from "./app";
import { connectApp } from "./config/db";
import { getUserMedia } from "./crons/insta-cache-cron";
import { instaRefresh } from "./crons/insta-refresh.cron";
import cron from "node-cron";
const port = process.env.PORT || 4000;

const start = async () => {
  if (!process.env.INSTA_APP_ID) {
    const err = new Error("INSTA_APP_ID is not defined");
    throw err;
  }
  if (!process.env.INSTA_APP_SECRET) {
    const err = new Error("INSTA_APP_SECRET is not defined");
    throw err;
  }
  if (!process.env.INSTA_REDIRECT_URI) {
    const err = new Error("INSTA_REDIRECT_URI is not defined");
    throw err;
  }
  if (!process.env.MONGODB_CONNECTION_PROTOCOL) {
    const err = new Error("MONGODB_CONNECTION_PROTOCOL is not defined");
    throw err;
  }
  if (!process.env.MONGODB_CLUSTER_ADDRESS) {
    const err = new Error("MONGODB_CLUSTER_ADDRESS is not defined");
    throw err;
  }
  if (!process.env.MONGODB_DB_NAME) {
    const err = new Error("MONGODB_DB_NAME is not defined");
    throw err;
  }
  if (!process.env.MONGODB_USERNAME) {
    const err = new Error("MONGODB_USERNAME is not defined");
    throw err;
  }
  if (!process.env.MONGODB_PASSWORD) {
    const err = new Error("MONGODB_PASSWORD is not defined");
    throw err;
  }
  try {
    await connectApp();
    app.listen(port, () => {
      console.log(`Service is up on port: ${port}`);
      instaRefresh();

      // refresh instaAccessToken eg: weekly(every Sat)
      cron.schedule("0 0 * * 6", async () => {
        await instaRefresh();
      });

      // update instaPhotos Cache every 3 hours
      cron.schedule("0 */3 * * *", async () => {
        // this method fetches updated Insta images and saves to DB.
        await getUserMedia();
      });
    });
  } catch (error) {
    console.log(error);
  }
};

start();
