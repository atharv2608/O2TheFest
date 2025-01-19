import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/lib/sendResponse";
import { Role } from "@/types";
import mongoose from "mongoose";
import CollegeModel from "@/models/college.model";

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    // Authenticate and authorize the user
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || ![Role.SUPERUSER, Role.ADMIN_HEAD].includes(user.role as Role)) {
      return sendResponse(false, "Unauthorized request", 403);
    }

    // Parse and validate the college ID from the request body
    const { collegeId } = await req.json();
    if (!collegeId || !mongoose.Types.ObjectId.isValid(collegeId)) {
      return sendResponse(false, "Invalid or missing college ID", 400);
    }

    // Check if the college exists
    const college = await CollegeModel.findById(collegeId).lean();
    if (!college) {
      return sendResponse(false, "College not found", 404);
    }

    // Check if the college has applied
    if (college.hasApplied) {
      return sendResponse(false, "Cannot delete a college that has applied", 409);
    }

    // Delete the college
    await CollegeModel.findByIdAndDelete(collegeId);

    return sendResponse(true, "College deleted successfully", 200);
  } catch (error) {
    return sendResponse(
      false,
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}
