import express from "express";
import connectdatabase from "./database/db.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

connectdatabase();

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import wishlistRoutes from "./routes/wishlist.js";
import addressRoutes from "./routes/address.js";
import paymentRoutes from "./routes/payment.js";

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
