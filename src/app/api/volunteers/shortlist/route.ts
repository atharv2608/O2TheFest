import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/lib/sendResponse";
import mongoose from "mongoose";
import VolunteerModel from "@/models/volunteer.model";
import { Role } from "@/types";

export async function PUT(req: Request) {
  await dbConnect();

  try {
    // Authenticate and authorize user
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || ![Role.ADMIN_HEAD, Role.SUPERUSER].includes(user.role as Role)) {
      return sendResponse(false, "Unauthorized request", 403);
    }

    // Parse and validate the volunteer IDs from the request body
    const { volunteerIds } = await req.json();
    if (!Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return sendResponse(false, "Volunteer IDs are required", 400);
    }

    const invalidIds = volunteerIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return sendResponse(false, "One or more volunteer IDs are invalid", 400);
    }

    // Update the `shortlisted` field for the specified volunteers
    const result = await VolunteerModel.updateMany(
      { _id: { $in: volunteerIds } },
      { $set: { shortlisted: true } },
      { multi: true }
    );

    return sendResponse(
      true,
      "Volunteers updated successfully",
      200,
      result
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
