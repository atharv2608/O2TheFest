import cloudinary from "./cloudinary";
import { Readable } from "stream";

const uploadToCloudinary = async (file: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create the Cloudinary upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // Handles different types of files (images, videos, etc.)
        (error, result) => {
          if (error) {
            return reject(error); // Reject if there's an error
          }
          if (result?.secure_url) {
            resolve(result.secure_url); // Resolve with the uploaded image URL
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        }
      );
  
      // Pipe the file stream to Cloudinary
      file.pipe(uploadStream);
    });
  };
  
  export default uploadToCloudinary;