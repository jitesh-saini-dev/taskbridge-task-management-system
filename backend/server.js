const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const taskRoutes = require("./routes/taskRoutes");

app.use("/", taskRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB Error:", error.message);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on port ${PORT}`);
});