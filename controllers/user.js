import { deleteImageOnCloudinary } from "../utils/cloudinary.js";

export const updateProfilePic = async (req, res) => {
  try {
    const user = req.user;
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
