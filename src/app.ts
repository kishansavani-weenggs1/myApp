import express, { Application } from "express";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import fileUploadRoutes from "./routes/fileUpload.js";
import messageRoutes from "./routes/messages.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cookieParser());
app.use(httpLogger);

app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", fileUploadRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

export default app;
