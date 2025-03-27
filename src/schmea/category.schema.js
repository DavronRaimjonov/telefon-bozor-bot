import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  title: String,
  status: {
    type: Boolean,
    default: true,
  },
});

const Category = model("Category", categorySchema);
export default Category;
