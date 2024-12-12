import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export async function uploadFileToCloudinary(
  file: Buffer,
  fileName: string,
  mimeType: string,
  directory: string = "uploads"
) {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 2MB limit.");
  }

  // Sanitize directory and filename
  const sanitizedDirectory = directory
    .replace(/[^a-z0-9-_]/gi, "")
    .toLowerCase()
    .trim();

  const sanitizedFileName = fileName
    .replace(/[^a-z0-9.-]/gi, "")
    .toLowerCase()
    .trim()
    .split('.')[0]; // Remove extension for Cloudinary

  try {
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: sanitizedDirectory,
          public_id: sanitizedFileName,
          resource_type: 'image'
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file);
    });
    // Return the secure URL of the uploaded file
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary: ", error);
    throw new Error("Failed to upload file. Please try again later");
  }
}