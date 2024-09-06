import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const deleteImageOnCloudinary = async (img) => {
  const publicId = img.split("/").slice(-2).join("/").split(".")[0];

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted on cloudinary : ", result);
  } catch (error) {
    console.log("Error while deleting image on cloudinary : ", error);
  }
};
