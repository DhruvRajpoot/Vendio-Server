import User from "../database/models/user.js";
import { OAuth2Client } from "google-auth-library";
import { generateRandomString } from "../utils/helper.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Add user (register user)
export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({ email, password, firstName, lastName });

    const response = await user.save();
    const token = await response.generateAuthToken();

    const filterUser = {
      _id: response._id.toString(),
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      isVerified: response.isVerified,
    };

    res.status(201).json({
      message: "User added successfully",
      token,
      user: filterUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const token = await user.generateAuthToken();
    const filterUser = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      message: "User logged in successfully",
      user: filterUser,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google Register
export const googleregister = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: "Please provide Google token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      firstName: name,
      profilePic: null,
      password: generateRandomString(10),
      isVerified: true,
    });

    const response = await user.save();
    const token = await response.generateAuthToken();

    const filterUser = {
      _id: response._id.toString(),
      email: response.email,
      firstName: response.firstName,
      profilePic: response.profilePic,
      isVerified: response.isVerified,
    };

    res.status(201).json({
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

// Google Login
export const googlelogin = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: "Please provide Google token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const token = await user.generateAuthToken();
    const filterUser = {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      message: "User logged in successfully",
      user: filterUser,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while logging in user with Google",
      error: error.message,
    });
  }
};
