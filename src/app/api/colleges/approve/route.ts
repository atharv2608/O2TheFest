import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/lib/sendResponse";
import { Role } from "@/types";
import mongoose from "mongoose";
import CollegeModel from "@/models/college.model";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse(false, "Unauthorized", 401);
    }
    const user = session.user;
    if (!user || ![Role.SUPERUSER, Role.ADMIN_HEAD].includes(user.role as Role)) {
      return sendResponse(false, "Unauthorized request", 403);
    }

    const { collegeIds } = await req.json();

    if (
      !Array.isArray(collegeIds) ||
      collegeIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return sendResponse(false, "Invalid or missing college IDs", 400);
    }

    const { matchedCount, modifiedCount } = await CollegeModel.updateMany(
      { _id: { $in: collegeIds } },
      { $set: { isApproved: true } }
    );

    if (matchedCount === 0) {
      return sendResponse(false, "No matching colleges found", 404);
    }

    return sendResponse(
      true,
      `${modifiedCount} out of ${matchedCount} colleges approved successfully`,
      200
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
