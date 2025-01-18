import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/lib/sendResponse";
import { Role } from "@/types";
import CollegeModel from "@/models/college.model";
import ClModel from "@/models/cl.model";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse(false, "Unauthenticated request", 401);
    }
    const user = session.user as User;
    if (![Role.SUPERUSER, Role.ADMIN_HEAD].includes(user.role as Role)) {
      return sendResponse(false, "Unauthorized request", 403);
    }

    const { collegeId } = await req.json();
    if (!collegeId) return sendResponse(false, "College ID is required", 400);

    const [updatedCollege, deletedCL] = await Promise.all([
      CollegeModel.findByIdAndUpdate(
        collegeId,
        {
          $set: {
            hasApplied: false,
            isApproved: false,
          },
          $unset: {
            cl: 1,
            password: 1,
          },
        },
        { new: true }
      ),
      ClModel.findOneAndDelete({ college: collegeId }),
    ]);

    // Handle potential errors
    if (!updatedCollege) return sendResponse(false, "College not found", 404);
    if (!deletedCL) return sendResponse(false, "CL not found", 404);

    return sendResponse(
      true,
      "College and CL updated successfully",
      200,
      updatedCollege
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
