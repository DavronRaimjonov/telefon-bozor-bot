import Order from "../../schmea/order.schema.js";
import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";
import { adminKeyboard, userKeyboard } from "../keyboard/index.js";
import { getLocationInfo } from "./location.js";

export const order_product = async (chatId, product, counter) => {
  let user = await Users.findOne({ chatId });
  await Users.findByIdAndUpdate(
    user._id,
    {
      $set: {
        action: "order",
      },
    },
    {
      new: true,
    }
  );

  await Order.create({
    user: user._id,
    product,
    counter,
    status: 0,
    createdAt: new Date(),
  });
  bot.sendMessage(
    chatId,
    "Mahsulotni buyurtma qilish uchun dostavka manzilini jo'nating !",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Lokatsiya jo'natish",
              request_location: true,
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
};

export const end_order = async (chatId, location) => {
  const user = await Users.findOne({ chatId });
  let order = await Order.findOne({ user: user._id, status: 0 })
    .populate(["product"])
    .lean()
    .exec();

  if (order) {
    await Order.findByIdAndUpdate(
      order._id,
      { $set: { location, status: 1, createdAt: new Date() } },
      { new: true }
    );
  }
  const locationInfo = await getLocationInfo(
    location.latitude,
    location.longitude
  );

  const orderMessage = `
      🛍 <b>Yangi buyurtma!</b>
  
    👤 <b>Mijoz:</b> ${user.name || "Noma’lum"}
    📞 <b>Telefon:</b> <a href="tel:+${user.phone_number}">${
    user.phone_number
  }</a>
    📍 <b>Manzil:</b> ${locationInfo}
    📦 <b>Mahsulot:</b> ${order.product.title}
    💰 <b>Narxi:</b> ${Number(
      order.product.price * order.counter
    ).toLocaleString()} so'm
    🛒 <b>Miqdor:</b> ${order.counter} dona
       <b>Buyurtma vaqti: 🕔</b> ${order.createdAt}
    🚀 <b>Tez orada yetkazib berish kerak!</b>
          `;

  await Users.findByIdAndUpdate(user._id, { $set: { action: "Katalog" } });
  await bot.sendMessage(-1002597865724, orderMessage, { parse_mode: "HTML" });
  await bot.sendMessage(
    chatId,
    "Buyurtmagiz qabul qilindi. Tez orada menejerlarimiz siz bilan bo'g'lanadi",
    {
      reply_markup: {
        keyboard: user.admin ? adminKeyboard : userKeyboard,
        resize_keyboard: true,
      },
    }
  );
};
export const show_order = async (chatId) => {
  const user = await Users.findOne({ chatId });
  let orders = await Order.find({ user: user._id, status: 1 }).populate([
    "product",
  ]);

  if (!orders.length) {
    return bot.sendMessage(chatId, "📦 Sizda aktiv zakaslar yo‘q.");
  }

  orders.forEach((order) => {
    let product_status =
      order.status === 1 ? "Holati: ✅ Aktiv" : "❌ Bekor qilingan";

    const orderMessage = `
      🛍 <b>Buyurtma tafsilotlari</b>
  
    📦 <b>Mahsulot:</b> ${order.product.title}
    💰 <b>Narxi:</b> ${Number(
      order.product.price * order.counter
    ).toLocaleString()} so'm
    🛒 <b>Miqdor:</b> ${order.counter} dona
    ${product_status}
    `;

    bot.sendMessage(chatId, orderMessage, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🗑 O‘chirish",
              callback_data: `delete_order-${order._id}`,
            },
          ],
        ],
      },
    });
  });
};

export const delete_order = async (chatId, id, messageId) => {
  let user = await Users.findOne({ chatId });
  let order = await Order.findOne({ user: user._id, status: 1 })
    .populate(["product"])
    .lean()
    .exec();

  await Order.deleteOne({ _id: id });

  const locationInfo = await getLocationInfo(
    order.location.latitude,
    order.location.longitude
  );
  const orderMessage = `
    🛍 <b>Bekor qilindi!</b>

  👤 <b>Mijoz:</b> ${user.name || "Noma’lum"}
  📞 <b>Telefon:</b> <a href="tel:+${user.phone_number}">${
    user.phone_number
  }</a>
  📍 <b>Manzil:</b> ${locationInfo}
  📦 <b>Mahsulot:</b> ${order.product.title}
  💰 <b>Narxi:</b> ${Number(
    order.product.price * order.counter
  ).toLocaleString()} so'm
  🛒 <b>Miqdor: </b> ${order.counter} dona
     <b>Mahsulot holati</b> ❌ Zakas bekor qilindi
        `;
  await bot.deleteMessage(chatId, messageId);
  await bot.sendMessage(chatId, "Zakas bekor qiliindi");
  await bot.sendMessage(-1002597865724, orderMessage, { parse_mode: "HTML" });
};
