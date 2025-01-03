// routes/auth.route.js
import express from "express";
import passport from "passport";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

// Google Authentication routes
router.get("/google", passport.authenticate("google", {
    scope: ["email", "profile"]
}),(req, res) => {
    console.log("route /google");
    res.redirect("http://localhost:5173/"); // Redirect to frontend after successful login
});

router.get("/google/callback", 
    (req, res, next) => {
        next();
    },
    passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => {
        res.redirect("http://localhost:5173"); 
    }
);

export default router;