import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import VolunteerModel from "@/models/volunteer.model";
import { volunteerSchema } from "@/schema/volunteerSchema";
import { uploadFileToCloudinary } from "@/config/cloudinary";
import path from "path";

export async function POST(request: Request) {
  await dbConnect();
  try {
    //Extracting Form Data
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

    //College ID file
    const file = formData.get("collegeId") as File;
    if (!file) return sendResponse(false, "File is required", 400);

    //Checking file type
    if (!file.type.startsWith("image/")) {
      return sendResponse(false, "Only image files are allowed", 400);
    }

    //Validating data using zod
    const validation = volunteerSchema.safeParse({
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
      password,
      collegeId: file,
    });

    if (!validation.success) {
      // Return the first validation error message
      return sendResponse(false, validation.error.issues[0].message, 400);
    }

    //Checking existing volunteer by email, phone and roll no.
    const existingVolunteer = await VolunteerModel.findOne({
      $or: [{ email }, { phone }, { rollNo }],
    });

    if (existingVolunteer)
      return sendResponse(
        false,
        "Volunteer with similar contact details or roll no already exists",
        409
      );

    //Creating buffer of the Id image and uploading it to S3 bucket
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectURL = await uploadFileToCloudinary(
      buffer,
      `${rollNo?.toString().toLowerCase()}-${Date.now()}${path.extname(
        file.name
      )}`,
      file.type,
      "id-cards"
    );

    //creating new volunteer
    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phone,
      year,
      course,
      rollNo,
      preferredCommittees: [
        preferredCommittee1,
        preferredCommittee2,
        preferredCommittee3,
      ],
      partOfO2,
      collegeId: objectURL,
      committee: preferredCommittee1,
      password,
    });

    //Selecting required fields from created volunteer and sending response
    const createdVolunteer = await VolunteerModel.findById(
      newVolunteer._id
    ).select("firstName lastName email rollNo preferredCommittees collegeId");

    if (!createdVolunteer)
      return sendResponse(false, "Failed to create volunteer", 500);

    return sendResponse(true, "Registration Successful", 200, createdVolunteer);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
