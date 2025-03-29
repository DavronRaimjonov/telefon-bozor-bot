import { Schema, model } from "mongoose";

const productsSchema = new Schema({
  title: String,
  price: String,
  img: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  status: {
    type: Boolean,
    default: false,
  },
});

const Products = model("Proudcts", productsSchema);
export default Products;
