import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});


        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating referesh and access tokens")
    }
}


const registerUser = asyncHandler( async(req, res) => {
    //get user detail from frontend
    //validation - not empty
    //chech if account exist: we can check with email or username 
    //check for images, chehck for avatar
    //upload them to cloudnairy, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return response (if user created)

    //yaha pe req.body se extract kiye sare data points
    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);

    //yaya check kiya kahi kisi ne empty field toh nahi pass kar di
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "all fields are required")
    }

    //check if user already exist with the same email or username
    const existedUser = await User.findOne({
         $or: [{ email }, { username }]
    });

    //agar karta hai exist to error dedo nahi toh aange badho
    if (existedUser) {
         throw new ApiError(400, "User with email or username already exists");
    }

    // console.log(req.files);
    

    //local path decided kar rahe hai jaha pe humne temporarily file store ki hai
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;


    //cover image ke liye alag se check kar rahe hai kyuki wo optional hai
    let coverImageLocalPath;
    if(req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    //avatar file is must hai isliye yaha pe check kar rahe hai
    if (!avatarLocalPath) {
        throw new ApiError(400, "Api file is required")
    }
    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Api file is required")
    }

    //create user object and save in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //idhar hum voh likhege jo nahi chahiye 
    )

    //check if user got created
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    //return response (if user created)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully") 
    )

})

const loginUser = asyncHandler( async(req, res) => {
    //req body se data extract karo
    //username or email
    //find the user
    //password check kro
    //access token and refresh token generate kro
    //send cookies

    const {email, username, password} = req.body

    if (!username || !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                 {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )    
        )

})

const logoutUser = asyncHandler(async(req, res) => {
    //yaha hume 2 kaam karne hai 
    //koi bhi user logout kese kar sakta hai, sabse pehle hume uski cookies clear karni padegi
    //dusra ye ki accesstoke or refresh token ko bhi refresh karna pdega model me jo hyumne likha hai tabhi log out hoga user

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, {}, "User logged Out"))
    
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookieStore.refreshToken || req.body.refreshToken

    if (incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse (
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }    

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}