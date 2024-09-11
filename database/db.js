import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL;

const options = {
  dbName: process.env.DATABASE_NAME,
};

const connectdatabase = async () => {
  try {
    await mongoose.set("strictQuery", true);
    await mongoose.connect(url, options);
    console.log("connected to database successfully");
  } catch (err) {
    console.log("error while connecting to database ", err.message);
  }
};

export default connectdatabase;
