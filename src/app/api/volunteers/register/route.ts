import { uploadFileToS3 } from "@/lib/awsS3";
import { sendResponse } from "@/lib/sendResponse";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rollNo = formData.get("rollNo");
    const file = formData.get("file") as File;
    if (!file) return sendResponse(false, "File is required", 400);

    if (!file.type.startsWith("image/")) {
      return sendResponse(false, "Only image files are allowed", 400);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectURL = await uploadFileToS3(
      buffer,
      `${rollNo?.toString().toLowerCase()}-${Date.now()}${path.extname(
        file.name
      )}`,
      file.type
    );

    return sendResponse(true, "File Uploaded", 200, { objectURL: objectURL });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
