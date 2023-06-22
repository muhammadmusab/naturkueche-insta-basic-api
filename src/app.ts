// Builtin modules
import path from "path";

// Installed modules
import express from "express";
import { config } from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
import instaRoutes from "./routes/insta";
import { errorHandler } from "./middlewares/error-middleware";
config();
// config({
//   path: path.join(__dirname, `/${process.env.NODE_ENV}.env`),
// });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("pages/index");
});
// app.get("/auth", (req, res) => {
//   res.render("pages/index");
// });

app.use("/insta", instaRoutes);
// app.use(cors());
app.use(express.json());

// app.use(cookieParser());

// app.use('/media', express.static(path.join(__dirname,'media')))

app.use(errorHandler);

export { app };

// For mongoose and ts read this if issue arises (but test first only if issue arise then read)
// https://medium.com/swlh/typescript-with-mongoose-and-node-express-24073d51d2ee
