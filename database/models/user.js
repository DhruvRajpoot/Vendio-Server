import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
    },
    lastName: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving the user model
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password entered by user with the password in the database
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Generate an auth token for the user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const payload = {
    _id: user._id.toString(),
    email: user.email,
  };
  try {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESHTOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Error generating tokens");
  }
};

const User = mongoose.model("User", userSchema);

export default User;
