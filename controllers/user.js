import { deleteImageOnCloudinary } from "../utils/cloudinary.js";
import User from "../database/models/user.js";

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "-password -createdAt -updatedAt -__v"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Error while fetching user details",
    });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found " });
    }

    const { pic, oldPic } = req.body;

    if (!pic) {
      user.profilePic = null;
      await user.save();

      if (oldPic) {
        deleteImageOnCloudinary(oldPic);
      }

      return res.status(200).json({
        message: "Profile pic updated successfully",
        user: user,
      });
    }

    user.profilePic = pic;
    await user.save();

    if (oldPic) {
      deleteImageOnCloudinary(oldPic);
    }

    res.status(200).json({
      message: "Profile pic updated successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Error while updating profile pic",
    });
  }
};
