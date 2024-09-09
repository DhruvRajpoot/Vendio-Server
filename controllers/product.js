import Product from "../database/models/product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while fetching products",
      error: error.message,
    });
  }
};

// Get product details by ID
export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      product,
      message: "Product details fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while fetching product",
      error: error.message,
    });
  }
};
