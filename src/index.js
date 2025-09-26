// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
   path: './env' 
})


connectDB()



















//we can make function like this also to connect to DB but
// function connectDB(){}
// connectDB()

//we have studied IFFI concept also (this is METHOD-1)


/*
 ( async () => {
    try { 
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        application.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log("ERROR: ", error);   
        throw error
        
    }
 })() 
*/