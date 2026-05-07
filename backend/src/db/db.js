import mongoose from "mongoose";
import dns from "dns";

// 🔥 force IPv4 (fix for your SRV issue)
// dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    // console.log("Connecting to DB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log(" Connected to DB");
  } catch (error) {
    console.error(" DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;