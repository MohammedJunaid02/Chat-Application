import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
const app = express();

dotenv.config();
const PORT = process.env.PORT;

app.use(express.json({
    limit: "10mb",  //added this to override the deafult 100kb limit as here uploading images is required
}));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
})