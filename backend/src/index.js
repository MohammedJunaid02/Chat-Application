// index.js
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport"; 
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import path from "path";
import session from "express-session"; 
import "./lib/oauth.js";

dotenv.config();

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set `secure` to true in production for HTTPS
    }
}));

app.use(express.json({
    limit: "10mb",  // Increased limit for image uploads
}));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static assets for production
if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
