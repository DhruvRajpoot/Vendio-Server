import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const deleteImageOnCloudinary = async (imgUrl) => {
  try {
    const publicId = imgUrl.split("/").slice(-2).join("/").split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image on Cloudinary:", error);
    throw new Error("Failed to delete image on Cloudinary");
  }
};
