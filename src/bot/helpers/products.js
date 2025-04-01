import Products from "../../schmea/products.schema.js";
import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";

export const new_product = async (chatId, category) => {
  const newProduct = new Products({
    category,
    status: 0,
  });
  await newProduct.save();
  let user = await Users.findOne({ chatId });

  await Users.findByIdAndUpdate(
    user._id,
    {
      $set: { action: "new_product_title" },
    },
    { new: true }
  );
  bot.sendMessage(chatId, "Yangi mahsulot nomini kiriting !");
};

export const add_products = async (chatId, value, slug) => {
  let steps = {
    title: {
      action: "new_product_price",
      text: "Mahsulot narxini kiriting !",
    },
    price: {
      action: "new_product_img",
      text: "Mahsulot rasmini kiriting !",
    },
    img: {
      action: "new_product_text",
      text: "Mahsulot qisqa nom kiriting !",
    },
  };

  let user = await Users.findOne({ chatId });
  let product = await Products.findOne({ status: 0 });
  if (!product) {
    product = new Products({ status: 0 });
  }

  if (["title", "text", "img", "price"].includes(slug)) {
    product[slug] = value;
    if (slug === "text") {
      product.status = 1;
      await product.save();
      await Users.findByIdAndUpdate(user._id, { $set: { action: "Katalog" } });
      bot.sendMessage(chatId, "Mahsulot qo'shildi !");
    } else {
      await Users.findOneAndUpdate(
        { _id: user._id },
        { $set: { action: steps[slug].action } },
        { new: true }
      );
      bot.sendMessage(chatId, steps[slug].text);
    }
    await product.save();
  }
};
export const clear_draft_product = async () => {
  await Products.deleteMany({ status: 0 });
};

export const show_product = async (
  chatId,
  id,
  counter = 1,
  messageId = null
) => {
  const product = await Products.findById(id);
  const user = await Users.findOne({ chatId });
  await Users.findByIdAndUpdate(
    user._id,
    { $set: { action: `counter-1` } },
    { new: true }
  );
  const caption =
    `📱 <b>${product.title}</b>\n\n` +
    `💰 <b>Narxi:</b> ${
      Number(product.price)?.toLocaleString() || product.price
    } so'm\n\n` +
    `${product.text}\n\n` +
    `📞 <b>Bog‘lanish:</b> <a href="tel:+998770224446">+998 77 022 44 46</a>\n\n` +
    `✅ <i>Sotib olish yoki batafsil ma'lumot uchun biz bilan bog'laning!</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "+",
          callback_data: `increment_product-${product._id}-${counter}`,
        },
        {
          text: counter,
          callback_data: "counter",
        },
        {
          text: "-",
          callback_data: `decrement_product-${product._id}-${counter}`,
        },
      ],
      [
        {
          text: "🛒 Buyurtma berish",
          callback_data: `order_product-${product._id}-${counter}`,
        },
      ],
      user.admin
        ? [
            {
              text: "✏️ Malumotni tahrirlash",
              callback_data: `edit_product-${product._id}`,
            },
            {
              text: "🗑 Malumotni o'chirish",
              callback_data: `delete_product-${product._id}`,
            },
          ]
        : [],
    ],
  };

  try {
    if (messageId) {
      // Xabarni yangilashga harakat qilamiz
      await bot.editMessageMedia(
        {
          type: "photo",
          media: product.img,
          caption: caption,
          parse_mode: "HTML",
        },
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: keyboard,
        }
      );
    } else {
      // Yangi xabar yuborish
      await bot.sendPhoto(chatId, product.img, {
        caption,
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error("❌ Xabarni yangilashda xatolik:", error.message);
    if (error.message.includes("message is not modified")) {
      return;
    }
  }
};
