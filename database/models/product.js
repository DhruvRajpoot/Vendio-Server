import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  categories: { type: [String], required: true },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
});

productSchema.pre("save", function (next) {
  this.discountedPrice = Math.floor(this.price * (1 - this.discount / 100));
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
