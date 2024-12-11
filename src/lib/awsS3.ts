import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET as string,
  },
});

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  mimeType: string,
  directory: string = "uploads"
) {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
  }

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
    .trim();

  // Construct full key with directory
  const fullKey = `${sanitizedDirectory}/${sanitizedFileName}`;

  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: fullKey,
      Body: file,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    //constructs the object url
    const objectURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullKey}`;

    return objectURL;
  } catch (error) {
    console.error("Error uploading file to S3: ", error);
    throw new Error("Failed to upload file. Please try again later");
  }
}
