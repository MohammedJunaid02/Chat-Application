import jwt from "jsonwebtoken";

export const generateToken = async (userId,res) => {
    const token = jwt.sign({
        userId
    }, 
    process.env.JWT_SECRET,
    {
        expiresIn:"7D"
    })

    res.cookie("jwt",token,{
        maxAge: 60 * 60 * 24 * 7 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development"
    });
    // console.log(`token: ${token}`);
    // console.log(`res.cookie: ${res.cookie}`);
    // return token;
};