import Users from "../schmea/users.schema.js";
import bot from "./bot.js";
import {
  deleteCategory,
  editCategory,
  new_cateogry,
  pagination_category,
  show_category,
} from "./helpers/category.js";
import { delete_order, order_product } from "./helpers/order.js";
import { new_product, show_product } from "./helpers/products.js";
bot.on("callback_query", (query) => {
  const { data } = query;
  const chatId = query.from.id;
  const messageId = query.message.message_id;
  if (data === "new_cateogry") {
    new_cateogry(chatId);
  }
  if (["next_category", "back_category"].includes(data)) {
    pagination_category(chatId, data, messageId);
  }
  if (data.includes("category_")) {
    const id = data.split("_")[1];
    show_category(chatId, id);
  }
  if (data.includes("del_category-")) {
    const id = data.split("-")[1];
    deleteCategory(chatId, id);
  }
  if (data.includes("edit_category-")) {
    const id = data.split("-")[1];
    editCategory(chatId, id);
  }
  if (data.includes("new_product-")) {
    const id = data.split("-")[1];
    new_product(chatId, id);
  }
  if (data.includes("show_product-")) {
    const id = data.split("-")[1];
    show_product(chatId, id);
  }
  if (data.includes("increment_product-")) {
    let id = data.split("-");
    show_product(chatId, id[1], +id[2] + 1, messageId);
  }
  if (data.includes("decrement_product-")) {
    let id = data.split("-");
    if (+id[2] > 1) {
      show_product(chatId, id[1], +id[2] - 1, messageId);
    }
  }
  if (data.includes("order_product-")) {
    let id = data.split("-");
    order_product(chatId, id[1], id[2]);
  }
  if (data.includes("delete_order-")) {
    let id = data.split("-")[1];
    if (!id) {
      return bot.sendMessage("Malumot xato");
    }
    delete_order(chatId, id, messageId);
  }
});
