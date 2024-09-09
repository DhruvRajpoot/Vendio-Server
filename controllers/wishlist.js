import Wishlist from "../database/models/wishlist.js";
import Product from "../database/models/product.js";

// Add product to wishlist
export const addProductToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Product added to wishlist", wishlist });
    } else {
      return res.status(400).json({ message: "Product already in wishlist" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error adding product to wishlist",
      error: error.message,
    });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  const userId = req.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    if (!wishlist) {
      return res.status(200).json({ wishlist: { products: [] } });
    }
    res.status(200).json({ wishlist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving wishlist", error: error.message });
  }
};

// Remove product from wishlist
export const removeProductFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Product removed from wishlist", wishlist });
    } else {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error removing product from wishlist",
      error: error.message,
    });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  const userId = req.user._id;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();
    res.status(200).json({ message: "Wishlist cleared", wishlist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing wishlist", error: error.message });
  }
};
