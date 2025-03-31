import { text } from "express";
import Category from "../../schmea/category.schema.js";
import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";
import Products from "../../schmea/products.schema.js";
import { clear_draft_product } from "./products.js";

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

export const show_category = async (chatId, id) => {
  clear_draft_product();
  const findCategory = await Category.findById(id);
  const user = await Users.findOne({ chatId });
  const products = await Products.find({ status: 1, category: id }).populate(
    "category"
  );
  let list = products.map((value) => [
    {
      text: value.title,
      callback_data: `show_product-${value._id}`,
    },
  ]);

  await Users.findOneAndUpdate(
    user._id,
    {
      $set: { action: `category_${findCategory._id}` },
    },
    { new: true }
  );

  const userShowCategory = [];
  const adminShowCategory = [
    [
      {
        text: "Mahsulotni tahrirlash",
        callback_data: `edit_category-${findCategory._id}`,
      },
      {
        text: "Mahsulotni o'chirish",
        callback_data: `del_category-${findCategory._id}`,
      },
    ],
    [
      {
        text: "Yangi mahsulot",
        callback_data: `new_product-${findCategory._id}`,
      },
    ],
  ];
  bot.sendMessage(chatId, `${findCategory.title} turkumidagi mahulotlar: `, {
    reply_markup: {
      inline_keyboard: [
        ...list,
        ...(user.admin ? adminShowCategory : userShowCategory),
      ],
    },
  });
};

export const deleteCategory = async (chatId, id) => {
  const user = await Users.findOne({ chatId });
  const category = await Category.findById(id);

  if (!user.admin) {
    return bot.sendMessage(chatId, "Sizga bunday amal bajarish mumkin emas !");
  }
  if (user.action !== "del_category") {
    await Users.findOneAndUpdate(
      user._id,
      {
        $set: { action: "del_category" },
      },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      `Siz ${category.title} turkumini o'chirmoqchimisiz ?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Bekor qilish",
                callback_data: `category_${category._id}`,
              },
            ],
            [
              {
                text: "O'chirish",
                callback_data: `del_category-${category._id}`,
              },
            ],
          ],
        },
      }
    );
  } else {
    await Products.deleteMany({ categoryId: id });
    await Category.deleteOne({ _id: id });
    bot.sendMessage(
      chatId,
      `${category.title} turkumi o'chirildi menyudan tanlang`
    );
  }
};
export const editCategory = async (chatId, id) => {
  const user = await Users.findOne({ chatId });
  const category = await Category.findById(id);

  if (!user.admin) {
    return bot.sendMessage(chatId, "Sizga bunday amal mumkin emas");
  }

  await Users.findOneAndUpdate(
    user._id,
    {
      $set: { action: `edit_category-${category._id}` },
    },
    { new: true }
  );
  bot.sendMessage(chatId, "Turkum uchun yangi nom kiriting");
};

export const saveCategory = async (chatId, title) => {
  const user = await Users.findOne({ chatId });
  await Users.findOneAndUpdate(
    user._id,
    {
      $set: { action: `menu` },
    },
    { new: true }
  );
  const id = user.action.split("-")[1];
  await Category.findOneAndUpdate(
    { _id: id },
    { $set: { title } },
    { new: true }
  );
  bot.sendMessage(chatId, "Turkum yangilandi menyudan tanlang");
};
