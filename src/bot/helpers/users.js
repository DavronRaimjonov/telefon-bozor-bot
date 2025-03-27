import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";
import { userKeyboard } from "../keyboard/index.js";

export const get_all_user = async (msg) => {
  const chatId = msg.from.id;
  const findUsers = await Users.findOne({ chatId });
  if (findUsers) {
    const users = await Users.find();
    if (users.length === 0) {
      return bot.sendMessage("Foydalanuvchilar topilmadi");
    }
    let message = "👥 *Foydalanuvchilar ro'yxati:*\n\n";
    users.forEach((user, index) => {
      message += `🆔 *ID:* ${user._id}\n`;
      message += `👤 *Ism:* ${user.name}\n`;
      message += `📱 *Telefon:* ${user.phone_number}\n`;
      message += `🔹 *Status:* ${user.status ? "✅ Faol" : "❌ Bloklangan"}\n`;
      message += `📆 *Qo‘shilgan vaqt:* ${new Date(
        user.createdAt
      ).toLocaleString("uz-UZ")}\n`;
      message += "---------------------------------\n";
    });

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } else {
    bot.sendMessage(chatId, `Sizga bunday so'rov jo'natish mumkin emas`, {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
  }
};
