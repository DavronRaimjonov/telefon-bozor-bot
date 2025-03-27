import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect to MONGO");
  } catch (error) {
    console.log(error);
  }
}
