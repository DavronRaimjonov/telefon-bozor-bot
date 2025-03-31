import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Products",
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  createdAt: Date,
  status: {
    type: Number,
    default: 0,
  },
  counter: Number,
});

export const Order = model("Order", orderSchema);
export default Order;
