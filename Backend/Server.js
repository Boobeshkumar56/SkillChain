const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    
} catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); 
    
}


app.use("/api/auth", require("./Routes/Auth.Routes"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
