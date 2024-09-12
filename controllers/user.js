import { deleteImageOnCloudinary } from "../utils/cloudinary.js";
import User from "../database/models/user.js";
import cloudinary from "../utils/cloudinary.js";

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
    const file = req.file;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (file) {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "profile_pics",
            upload_preset: "low_res_image_preset",
          },
          async (error, result) => {
            if (error) {
              return res.status(500).json({ message: "Upload failed", error });
            }

            try {
              if (user.profilePic) {
                deleteImageOnCloudinary(user.profilePic);
              }

              user.profilePic = result.secure_url;
              await user.save();

              res.status(200).json({ message: "Profile pic updated", user });
            } catch (err) {
              return res
                .status(500)
                .json({ message: "Error updating user", error: err });
            }
          }
        )
        .end(file.buffer);
    } else {
      if (user.profilePic) {
        deleteImageOnCloudinary(user.profilePic);
        user.profilePic = "";
        await user.save();
      }

      res.status(200).json({ message: "Profile pic removed", user });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating profile pic", error: err });
  }
};
