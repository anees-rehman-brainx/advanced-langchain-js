require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { db } = require("./config");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Backend Working!!"));

db.then(() => {
  console.log("Database Connected Successfully");
  app.listen(PORT, console.log(`Server Started on PORT: ${PORT}`));
}).catch((err) => console.log("Database Connection Error: ", err));
