import { Schema, model } from "mongoose";

const productsSchema = new Schema({
  title: String,
  price: String,
  img: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  status: Number,
  text: String,
});

const Products = model("Products", productsSchema);
export default Products;
