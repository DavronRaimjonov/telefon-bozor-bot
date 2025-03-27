import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.config.js";
const app = express();
dotenv.config();

import "./bot/bot.js";
import "./bot/message.js";
import "./bot/query.js";
let PORT = process.env.PORT || 7070;

app.listen(PORT, () => {
  console.log("Server started");
  connectDB();
});
