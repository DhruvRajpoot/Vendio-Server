import User from "../database/models/user.js";
import jwt from "jsonwebtoken";

const checkuser = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  const token = authorization.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { _id, exp } = decoded;

    if (Date.now() >= exp * 1000) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    const user = await User.findOne({ _id });

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    if (user.isVerified === false) {
      return res
        .status(401)
        .json({ message: "Please verify your email to proceed" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: error.message || "You must be logged in" });
  }
};

export default checkuser;
