import express from "express";
import connectdatabase from "./database/db.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 8080;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
connectdatabase();

// Routes
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
