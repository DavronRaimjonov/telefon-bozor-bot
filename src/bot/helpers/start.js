import Users from "../../schmea/users.schema.js";
import bot from "../bot.js";
import { adminKeyboard, userKeyboard } from "../keyboard/index.js";

export const start = async (msg) => {
  const chatId = msg.from.id;
  const findUsers = await Users.findOne({ chatId });

  if (!findUsers) {
    const newUser = new Users({
      name: msg.from.first_name,
      chatId,
      admin: false,
      status: true,
      createdAt: new Date(),
      action: "request_connecct",
    });
    await newUser.save();
    bot.sendMessage(
      chatId,
      `Assolomu alaykum ${msg.from.first_name} Iltimos kontanktingizni jo'nating`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Kontakt",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    await Users.findByIdAndUpdate(
      findUsers._id,
      {
        ...findUsers,
        action: "menu",
      },
      {
        new: true,
      }
    );
    bot.sendMessage(
      chatId,
      `Menyuni tanlang ${findUsers.admin ? "Admin" : findUsers.name}`,
      {
        reply_markup: {
          keyboard: findUsers.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
};
export const request_contact = async (msg) => {
  const chatId = msg.from.id;
  if (msg.contact.phone_number) {
    let user = await Users.findOneAndUpdate(
      { chatId },
      {
        $set: {
          phone_number: msg.contact.phone_number,
          action: "menu",
          admin: msg.contact.phone_number === "998954104848",
        },
      },
      { new: true }
    );
    bot.sendMessage(
      chatId,
      `Menyuni tanlasng ${user.admin ? "Admin" : user.name}`,
      {
        reply_markup: {
          keyboard: user.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
};
