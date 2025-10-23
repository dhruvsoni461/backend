// require('dotenv').config({path: './env'})
// import express from "express";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
   path: './env' 
})

// // Middlewares (optional)
// app.use(express.json());


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is runnnig at port: ${process.env.PORT}`); 
    })
})
.catch((err) => {
    console.log("MONGODB db connection failed !!", err);
    
})



















//we can make function like this also to connect to DB but
// function connectDB(){}
// connectDB()

//we have studied IFFI concept also (this is METHOD-1)


/*
 ( async () => {
    try { 
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
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