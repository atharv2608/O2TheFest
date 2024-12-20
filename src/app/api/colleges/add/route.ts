import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/lib/sendResponse";
import { Role } from "@/types";
import { collegeSchema } from "@/schema/collegeSchema";
import CollegeModel from "@/models/college.model";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return sendResponse(false, "Unauthenticated request", 401);

    const user = session.user as User;
    if (user.role !== Role.SUPERUSER && user.role !== Role.ADMIN_HEAD) {
      return sendResponse(false, "Unauthorized request", 403);
    }

    const data = await req.json();
    const validation = collegeSchema.safeParse(data);
    if (!validation.success) {
      return sendResponse(false, validation.error.issues[0].message, 400);
    }

    const { collegeName, location, maxAcl } = data;

    const exisitingCollege = await CollegeModel.findOne({
      collegeName: { $regex: `^${collegeName}$`, $options: "i" },
    });

    if (exisitingCollege)
      return sendResponse(false, "College Name already exists", 409);

    const newCollege = await CollegeModel.create({
      collegeName,
      location,
      maxAcl,
    });

    if (!newCollege) return sendResponse(false, "Error creating college", 500);

    return sendResponse(true, "College created successfully", 201, newCollege);
  } catch (error) {
    console.error("Error creating college: ", error);
    return sendResponse(false, "Error creating college", 500);
  }
}
