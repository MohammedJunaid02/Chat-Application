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
	}, 
	async (request, accessToken, refreshToken, profile, done) => {
		try 
		{
			const email = profile.email;
			const existingUser = await User.findOne({ 
				email 
			});
			if (existingUser) 
			{
				generateToken(existingUser._id,request.res);
				console.log("User request.res:", request.res);
				return done(null, existingUser);
			}
			const user = await User.create({
				fullName: profile.displayName,
				email: profile.email,
				password: ''
			});
			generateToken(user._id,request.res);
			return done(null, user);
		}
		catch (error) 
		{
			console.error("GoogleStrategy Error:", error);
			return done(error, null);
		}
	}
));

  