import { connect } from "mongoose";

const connectionProtocol = process.env.MONGODB_CONNECTION_PROTOCOL;
const clusterAddress = process.env.MONGODB_CLUSTER_ADDRESS;
const dbUser = process.env.MONGODB_USERNAME;
const dbPassword = process.env.MONGODB_PASSWORD;
const dbName = process.env.MONGODB_DB_NAME;

export const connectApp = async function () {
  return connect(
    `${connectionProtocol}://${dbUser}:${dbPassword}@${clusterAddress}/${dbName}?retryWrites=true&w=majority`,
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      // autoIndex: process.env.NODE_ENV === "dev" ? true : false,
      autoIndex: true,
    }
  );
};
