import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("No MONGO_URI specified; running server in standalone mode.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully connected to mongoDB 👍`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
