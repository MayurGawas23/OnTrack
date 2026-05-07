import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const PORT = process.env.PORT || 5000;

// const startServer = async () => {
  connectDB();
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
// };

// startServer();