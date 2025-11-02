import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


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


export {registerUser}