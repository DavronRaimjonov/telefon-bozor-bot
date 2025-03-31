import Users from "../schmea/users.schema.js";
import bot from "./bot.js";
import {
  add_category,
  get_all_category,
  saveCategory,
} from "./helpers/category.js";
import { end_order, show_order } from "./helpers/order.js";
import { add_products } from "./helpers/products.js";
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
      return request_contact(msg);
    }
    if (msg.text === "Foydalanuvchilar") {
      return get_all_user(msg);
    }
    if (msg.text === "Katalog") {
      return get_all_category(msg.chat.id);
    }
    if (user.action === "add_category") {
      return add_category(msg);
    }
    if (user.action.includes("edit_category-")) {
      return saveCategory(chatId, msg.text);
    }
    if (user.action.includes("new_product_title")) {
      return add_products(chatId, msg.text, "title");
    }
    if (user.action.includes("new_product_price")) {
      return add_products(chatId, msg.text, "price");
    }
    if (user.action.includes("new_product_img")) {
      if (msg.document) {
        return bot.sendMessage(
          chatId,
          "❌ Rasmni file sifatida emas, rasm ko‘rinishida yuboring!"
        );
      }
      if (!msg.photo || msg.photo.length === 0) {
        return bot.sendMessage(chatId, "❌ Iltimos, haqiqiy rasm yuboring!");
      }

      let file_id = msg.photo[msg.photo.length - 1].file_id;
      return add_products(chatId, file_id, "img");
    }
    if (user.action.includes("new_product_text")) {
      return add_products(chatId, msg.text, "text");
    }
    if (msg.location && user.action === "order") {
      end_order(chatId, msg.location);
    }
  }
  if (msg.text === "/cart") {
    if (user) {
      show_order(chatId);
    }
  }
});
