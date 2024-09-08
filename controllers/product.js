import Product from "../database/models/product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({
      message: "Something went wrong while fetching products",
      error: error.message,
    });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({
      message: "Something went wrong while fetching product",
      error: error.message,
    });
  }
};
