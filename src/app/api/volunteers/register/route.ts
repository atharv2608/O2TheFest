import { uploadFileToS3 } from "@/lib/awsS3";
import { sendResponse } from "@/lib/sendResponse";
import VolunteerModel from "@/models/volunteer.model";
import { emptyInputValidation } from "@/utils/emptyInputValidation";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const year = formData.get("year");
    const course = formData.get("course");
    const rollNo = formData.get("rollNo");
    const password = formData.get("password");
    const preferredCommittee1 = formData.get("preferredCommittee1");
    const preferredCommittee2 = formData.get("preferredCommittee2");
    const preferredCommittee3 = formData.get("preferredCommittee3");
    const partOfO2 = formData.get("partOfO2");

    const isAnyInputEmpty = emptyInputValidation(
      firstName,
      lastName,
      email,
      phone,
      year,
      course,
      rollNo,
      preferredCommittee1,
      preferredCommittee2,
      preferredCommittee3,
      partOfO2,
      password
    );

    if (isAnyInputEmpty)
      return sendResponse(false, "All fields are required", 400);

    const file = formData.get("file") as File;
    if (!file) return sendResponse(false, "File is required", 400);

    if (!file.type.startsWith("image/")) {
      return sendResponse(false, "Only image files are allowed", 400);
    }

    const existingVolunteer = await VolunteerModel.findOne({
      $or: [{ email }, { phone }]
    });
    
    if(existingVolunteer) sendResponse(false, "Volunteer with similar contact details already exists", 409);

    const buffer = Buffer.from(await file.arrayBuffer());
    const objectURL = await uploadFileToS3(
      buffer,
      `${rollNo?.toString().toLowerCase()}-${Date.now()}${path.extname(
        file.name
      )}`,
      file.type
    );

    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phone,
      year,
      course,
      rollNo,
      preferredCommittees: [preferredCommittee1, preferredCommittee2, preferredCommittee3],
      partOfO2,
      collegeId: objectURL,
      committee: preferredCommittee1
    })

    return sendResponse(true, "File Uploaded", 200, { objectURL: objectURL });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
