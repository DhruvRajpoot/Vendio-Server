import User from "../database/models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import axios from "axios";
import { generateRandomString } from "../utils/helper.js";
import welcomeEmail from "../templates/welcomeEmail.js";
import verifyEmailTemplate from "../templates/verifyEmail.js";
import Token from "../database/models/token.js";
import passwordResetEmail from "../templates/passwordResetEmail.js";

// Add user (signup user)
export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password, firstName, lastName });

    await user.save();

    await sendVerificationEmail(user);

    res.status(200).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error while adding user",
      error: error.message,
    });
  }
};

// Send Verification Email
export const sendVerificationEmail = async (user) => {
  try {
    const verificationToken = crypto.randomUUID();

    const token = new Token({
      token: verificationToken,
      user: user._id,
      type: "emailverification",
    });

    await token.save();

    // Send verification email
    const emailSubject = "Verify Your Email";
    const emailMessage = verifyEmailTemplate(user, verificationToken);
    await sendEmail(user.email, emailSubject, emailMessage);
  } catch (error) {
    throw new Error("Error while sending verification email");
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    await sendVerificationEmail(user);

    res.status(200).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while resending verification email",
      error: error.message,
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const existingToken = await Token.findOne({
      token,
      type: "emailverification",
    });

    if (!existingToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findOne({ _id: existingToken.user });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    user.isVerified = true;
    await user.save();
    await Token.findByIdAndDelete(existingToken._id);

    const authtoken = await user.generateAuthToken();

    const filterUser = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    };

    // Send welcome email
    const emailSubject = `🚀 Welcome to Vendio, ${filterUser.firstName}! Your Account is Ready 🌟`;
    const emailMessage = welcomeEmail(filterUser);
    await sendEmail(filterUser.email, emailSubject, emailMessage);

    res.status(200).json({
      message: "Email verified successfully",
      user: filterUser,
      token: authtoken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while verifying email",
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    if (!user.isVerified) {
      await sendVerificationEmail(user);
      return res
        .status(403)
        .json({ message: "Please verify your email to login" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    const token = await user.generateAuthToken();

    const filterUser = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      message: "User logged in successfully",
      user: filterUser,
      token,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error while logging in user",
      error: error.message,
    });
  }
};

// Google Signup & Login
export const google = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: "Please provide Google token" });
    }

    const userProfile = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`
    );

    const { email, name, picture } = userProfile.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = await existingUser.generateAuthToken();
      const filterUser = {
        _id: existingUser._id.toString(),
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        profilePic: existingUser.profilePic,
        isVerified: existingUser.isVerified,
      };

      return res.status(200).json({
        message: "User logged in successfully",
        user: filterUser,
        token,
      });
    }

    const user = new User({
      email,
      firstName: name,
      profilePic: picture,
      password: generateRandomString(10),
      isVerified: true,
    });

    const response = await user.save();
    const token = await response.generateAuthToken();

    const filterUser = {
      _id: response._id.toString(),
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      profilePic: response.profilePic,
      isVerified: response.isVerified,
    };

    // Send welcome email
    const emailSubject = `🚀 Welcome to Vendio, ${filterUser.firstName}! Your Account is Ready 🌟`;
    const emailMessage = welcomeEmail(filterUser);
    await sendEmail(email, emailSubject, emailMessage);

    return res.status(201).json({
      message: "User added successfully",
      token,
      user: filterUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while registering user with Google",
      error: error.message,
    });
  }
};

// Get access token from refresh token
export const getAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Please provide refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESHTOKEN_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const { _id, email, firstName, lastName, profilePic, isVerified } =
          decoded;

        const accessToken = jwt.sign(
          {
            _id,
            email,
            firstName,
            lastName,
            profilePic,
            isVerified,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );

        res.status(200).json({
          message: "Access token generated successfully",
          accessToken,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Error while generating access token",
      error: error.message,
    });
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (user) => {
  try {
    const passwordResetToken = crypto.randomUUID();

    const token = new Token({
      token: passwordResetToken,
      user: user._id,
      type: "passwordreset",
    });

    await token.save();

    // Send password reset email
    const emailSubject = "Reset Your Password";
    const emailMessage = passwordResetEmail(user, passwordResetToken);
    await sendEmail(user.email, emailSubject, emailMessage);
  } catch (error) {
    throw new Error("Error while sending password reset email");
  }
};

// Forgot password
export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendPasswordResetEmail(existingUser);

    res.status(200).json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending password reset link",
      error: error.message,
    });
  }
};

// Set new password
export const setNewPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    if (!password || !token) {
      return res.status(400).json({
        message: "Please provide new password and token",
      });
    }

    const existingToken = await Token.findOne({ token, type: "passwordreset" });

    if (!existingToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(existingToken.user._id, {
      password: hashedPassword,
    });

    await Token.findByIdAndDelete(existingToken._id);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating password",
      error: error.message,
    });
  }
};
