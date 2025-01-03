import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
 

import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import dotenv from "dotenv";

dotenv.config();


passport.serializeUser((user , done) => { 
	done(null , user); 
}) 
passport.deserializeUser(function(user, done) { 
	done(null, user); 
}); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/google/callback",
    passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
    console.log("Inside Google OAuth Strategy callback");

    try {
        const email = profile.email;
        console.log(`Google profile email: ${email}`);

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("User exists:", userExists);
			generateToken(userExists._id,request.res);
			request.res.status(200).json({
            _id: userExists._id,
            email: userExists.email,
            fullName: userExists.fullName,
            profilePic: userExists.profilePic
        })
            return done(null, userExists);
        }

        const user = await User.create({
            name: profile.displayName,
            email: profile.email,
            password: ''
        });

        console.log("User created:", user);
        return done(null, user);
    } catch (error) {
        console.error("GoogleStrategy Error:", error);
        return done(error, null);
    }
}));

  