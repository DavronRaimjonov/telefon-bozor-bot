import bot from "./bot.js";
import { new_cateogry, pagination_category } from "./helpers/category.js";

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
});
