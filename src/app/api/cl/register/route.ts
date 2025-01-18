import { uploadFileToCloudinary } from "@/config/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import ClModel from "@/models/cl.model";
import CollegeModel, { College } from "@/models/college.model";
import { clSchema } from "@/schema/clSchema";
import mongoose from "mongoose";
import path from "path";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const file = formData.get("collegeId") as File;
    if (!file) return sendResponse(false, "File is required", 400);

    //Checking file type
    if (!file.type.startsWith("image/")) {
      return sendResponse(false, "Only image files are allowed", 400);
    }
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: "cl",
      college: formData.get("college"),
      password: formData.get("password"),
      collegeId: file,
    };
    const validation = clSchema.safeParse(data);
    if (!validation.success) {
      return sendResponse(false, validation.error.issues[0].message, 400);
    }

    const { firstName, lastName, email, phone, college, password } = data;

    //Checking for exisiting CL and checking if college is present and not already applied
    const [existingCl, selectedCollege] = await Promise.all([
      ClModel.findOne({ $or: [{ email }, { phone }] }).lean(),
      CollegeModel.findById(college),
    ]);

    if (existingCl) {
      return sendResponse(false, "CL with similar email or phone exists", 409);
    }
    if (!selectedCollege) {
      return sendResponse(false, "College not found", 404);
    }
    if (selectedCollege.hasApplied || selectedCollege.isApproved) {
      return sendResponse(false, "College has already applied", 409);
    }

    //Upload id to cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectURL = await uploadFileToCloudinary(
      buffer,
      `${
        firstName + "-" + lastName?.toString().toLowerCase()
      }-${Date.now()}${path.extname(file.name)}`,
      file.type,
      "cl-idCards"
    );

    //Register new cl
    const newCl = await ClModel.create({
      firstName,
      lastName,
      email,
      phone,
      college,
      role: "cl",
      collegeId: objectURL,
    });

    if (!newCl) {
      return sendResponse(false, "Error creating CL", 500);
    }

    //Update college with ccCode and password
    const totalClCount = await ClModel.countDocuments();
    const hashedPassword = await bcrypt.hash(password as string, 10);
    const ccCode = `CC${String(totalClCount).padStart(3, "0")}`;
    await CollegeModel.updateOne(
      { _id: college },
      {
        $set: {
          ccCode: selectedCollege.ccCode || ccCode,
          password: hashedPassword,
          hasApplied: true,
          cl: new mongoose.Types.ObjectId(newCl._id as string),
        },
      }
    );

    return sendResponse(true, "CL created successfully", 201, newCl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
