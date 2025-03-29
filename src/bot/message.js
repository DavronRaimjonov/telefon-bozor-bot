import Users from "../schmea/users.schema.js";
import bot from "./bot.js";
import {
  add_category,
  get_all_category,
  saveCategory,
} from "./helpers/category.js";
import { request_contact, start } from "./helpers/start.js";
import { get_all_user } from "./helpers/users.js";

bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const user = await Users.findOne({ chatId });
  if (msg.text === "/start") { 
    start(msg);
  }
  if (user) {
    if (user.action === "request_connecct" && !user.phone_number) {
      request_contact(msg);
    }
    if (msg.text === "Foydalanuvchilar") {
      get_all_user(msg);
    }
    if (msg.text === "Katalog") {
      get_all_category(msg.chat.id);
    }
    if (user.action === "add_category") {
      add_category(msg);
    }
    if (user.action.includes("edit_category-")) {
      saveCategory(chatId, msg.text);
    }
  }
});
