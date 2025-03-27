import { text } from "express";
import Category from "../../schmea/category.schema.js";
import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";

export const get_all_category = async (chatId, page = 1, messageId = null) => {
  const user = await Users.findOne({ chatId });
  let limit = 5;
  let skip = (page - 1) * limit;
  let category = await Category.find().skip(skip).limit(limit);
  if (page === 1) {
    await Users.findByIdAndUpdate(
      user._id,
      { $set: { action: `category-1` } },
      { new: true }
    );
  }
  let list = category.map((value) => [
    {
      text: value.title,
      callback_data: `category_${value._id}`,
    },
  ]);
  let keyboard = {
    inline_keyboard: [
      ...list,
      [
        {
          text: "Oldingi",
          callback_data: "back_category",
        },

        {
          text: page,
          callback_data: "counter",
        },
        category.length === limit
          ? {
              text: "Keyingi",
              callback_data: "next_category",
            }
          : null,
      ].filter(Boolean),
      user.admin
        ? [
            {
              text: "Yangi Kategory",
              callback_data: "new_cateogry",
            },
          ]
        : [],
    ],
    remove_keyboard: true,
  };
  try {
    if (messageId) {
      await bot
        .editMessageReplyMarkup(
          { inline_keyboard: keyboard.inline_keyboard },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        )
        .catch((err) => {
          if (
            err.response &&
            err.response.body &&
            err.response.body.error_code === 400
          ) {
            // Agar xabar o'zgarmagan bo'lsa, errorni e'tiborsiz qoldiramiz
            console.log("🔹 Xabar o‘zgarmagan, yangilanmadi.");
          } else {
            console.error("❌ Xatolik:", err);
          }
        });
    } else {
      await bot.sendMessage(chatId, "📌 Kategoriyalar ro‘yxati:", {
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error("❌ Xabar yuborishda xatolik:", error);
  }
};

export const new_cateogry = async (chatId) => {
  const user = await Users.findOne({ chatId });
  if (!user.admin) {
    return bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas");
  }

  await Users.findOneAndUpdate(
    { chatId },
    {
      $set: {
        action: "add_category",
      },
    },
    { new: true }
  );
  bot.sendMessage(chatId, "Yangi kategoriya nomini kiriting");
};

export const add_category = async (msg) => {
  const chatId = msg.from.id;
  const title = msg.text;
  let user = await Users.findOne({ chatId });
  if (!user || !user.admin || user.action !== "add_category") {
    return bot.sendMessage(chatId, "Sizga bunday so‘rov jo‘natish mumkin emas");
  }
  let category = await Category.findOne({ title });

  if (category) {
    return bot.sendMessage(chatId, "Bu kategoriya allaqachon mavjud!");
  }
  await Category.create({ title });
  await Users.findOneAndUpdate(
    { chatId },
    { $set: { action: "Katalog" } },
    { new: true }
  );
  get_all_category(chatId);
};

export const pagination_category = async (chatId, data, messageId) => {
  let user = await Users.findOne({ chatId });
  let page = 1;

  if (user.action.includes("category-")) {
    page = +user.action.split("-")[1];
    if (data === "back_category" && page > 1) {
      page--;
    }
  }
  if (data === "next_category") {
    page++;
  }
  await Users.findByIdAndUpdate(
    user._id,
    { $set: { action: `category-${page}` } },
    { new: true }
  );
  get_all_category(chatId, page, messageId);
};
