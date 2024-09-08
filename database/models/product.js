import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  category: { type: [String], required: true },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
