import zod from "zod";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const signUpBody = zod.object({
    email: zod.string().email().nonempty(),
	fullName: zod.string().nonempty({message:"must contain at least 1 character(s)"}),
	password: zod.string().nonempty({message:"must contain at least 1 character(s)"}).min(6, { message: "Password must be 6 or more characters long" }),
})

export const signup = async (req,res) => {
    try 
    {
        const parseResult = signUpBody.safeParse(req.body);
        console.log(JSON.stringify(parseResult));
        if(!parseResult.success){

            const groupedErrors = parseResult.error.errors.reduce((acc,error) => {
                const path = error.path.join(".");
                if(!acc[path]) acc[path] = [];
                acc[path].push(error.message);
                return acc;
            },{})
            
            console.log("1")
            return res.status(400).json({
                // error: parseResult.error.errors,
                errors: Object.entries(groupedErrors)
                    .map(([path,message]) => `${path} ${message.join(",")}\n`)
                    .join(",")
            });
        };

        const {fullName, email, password} = parseResult.data;

        const userExists = await User.findOne({email:email});
        
        if(userExists) return res.status(400).json({
            message: "Email/User already exists"
        });

        const salt = await bcrypt.genSalt(10)
        
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = new User({
            email: email,
            fullName: fullName,
            password: hashedPassword
        })

        if(user)
        {
            generateToken(user._id,res);
            await user.save();
            res.status(201).json({
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                profilePic: user.profilePic
            })
        }
        else
        {
            return  res.status(400).json({
                message: "Invalid user data"
            })
        }
    } 
    catch (error) 
    {
        console.log("Error in signup controller",error.message);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


const signInBody = zod.object({
    email: zod.string().email().nonempty(),
	password: zod.string()
})

export const login = async (req,res) => {
    try 
    {
        const parseResult = signInBody.safeParse(req.body);
        console.log(JSON.stringify(parseResult));
        if(!parseResult.success){

            const groupedErrors = parseResult.error.errors.reduce((acc,error) => {
                const path = error.path.join(".");
                if(!acc[path]) acc[path] = [];
                acc[path].push(error.message);
                return acc;
            },{})
            
            console.log("1")
            return res.status(400).json({
                // error: parseResult.error.errors,
                errors: Object.entries(groupedErrors)
                    .map(([path,message]) => `${message.join(",")}`)
                    .join(",")
            });
        };
        const {email,password} = parseResult.data;

        const user = await User.findOne({email:email});
        
        if(!user) return res.status(400).json({
            message: "Invalid credentials"
        });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect)
        {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        generateToken(user._id,res);
        return res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        })
    } 
    catch (error) 
    {
        console.log(`Error in login controller`, error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const logout = (req,res) => {
    try 
    {
        // if(res.cookie !== '')
        // {
            res.cookie("jwt","",{ maxAge:0 });
            res.status(200).json({
                message: "Logged out succesfully"
            });

        // }
    } 
    catch (error) 
    {
        console.log(`Error in logout controller`, error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const updateProfile = async (req, res) => {
    try 
    {
        const {profilePic} = req.body;

        const userId = req.user._id;

        if(!profilePic)
        {
            res.status(400).json({
                message: "Profile pic is required"
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{
            profilePic: uploadResponse.secure_url
        },
            {new:true}
        )
        res.status(200).json({
            updatedUser
        })
    } 
    catch (error) 
    {
        console.log(`Error in update profile:`, error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const checkAuth = (req, res) => {
    try 
    {
        res.status(200).json(req.user);
    } 
    catch (error) 
    {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}
