import Cart from "../database/models/cart.js";
import { products } from "../database/products.js";

// Add item to cart
export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.id === productId
      );

      if (existingItemIndex > -1) {
        // Update the quantity and total price of the existing item
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice =
          (cart.items[existingItemIndex].product.price -
            (cart.items[existingItemIndex].product.discount *
              cart.items[existingItemIndex].product.price) /
              100) *
          cart.items[existingItemIndex].quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            description: product.description,
            images: product.images,
            creationAt: product.creationAt,
            updatedAt: product.updatedAt,
            category: product.category,
            discount: product.discount,
            rating: product.rating,
          },
          quantity,
          totalPrice:
            (product.price - (product.discount * product.price) / 100) *
            quantity,
        });
      }
    } else {
      // Create a new cart with the item
      cart = new Cart({
        userId,
        items: [
          {
            product: {
              id: product.id,
              title: product.title,
              price: product.price,
              description: product.description,
              images: product.images,
              creationAt: product.creationAt,
              updatedAt: product.updatedAt,
              category: product.category,
              discount: product.discount,
              rating: product.rating,
            },
            quantity,
            totalPrice:
              (product.price - (product.discount * product.price) / 100) *
              quantity,
          },
        ],
      });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      });
    }
    res.status(200).json({ cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart", error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.id === productId
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({ message: "Item removed from cart", cart });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

// Update item quantity in cart
export const updateCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.id === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice =
        (cart.items[itemIndex].product.price -
          cart.items[itemIndex].product.discount) *
        quantity;
      await cart.save();
      return res.status(200).json({ message: "Cart item updated", cart });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

// Clear user's cart
export const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// Add multiple items to cart
export const addBulkToCart = async (req, res) => {
  const userId = req.user._id;
  const items = req.body.items;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    for (const { product, quantity } of items) {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Update quantity and total price
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice =
          (cart.items[existingItemIndex].product.price -
            cart.items[existingItemIndex].product.discount) *
          cart.items[existingItemIndex].quantity;
        console.log(
          `Updated item in cart: ${product.id}, quantity: ${cart.items[existingItemIndex].quantity}`
        );
      } else {
        // Add new item
        cart.items.push({
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            description: product.description,
            images: product.images,
            creationAt: product.creationAt,
            updatedAt: product.updatedAt,
            category: product.category,
            discount: product.discount,
            rating: product.rating,
          },
          quantity,
          totalPrice: (product.price - product.discount) * quantity,
        });
        console.log(
          `Added new item to cart: ${product.id}, quantity: ${quantity}`
        );
      }
    }

    await cart.save();
    console.log("Cart saved successfully:", cart);

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};
