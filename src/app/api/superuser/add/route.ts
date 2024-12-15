import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import AclModel from "@/models/acl.model";
import ClModel from "@/models/cl.model";
import SuperUserModel from "@/models/superuser.model";
import VolunteerModel from "@/models/volunteer.model";
import { superUserSchema } from "@/schema/superUserSchema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const validation = superUserSchema.safeParse(data);
    if (!validation.success)
      return sendResponse(false, validation.error.issues[0].message, 400);

    const { firstName, lastName, email, phone, canManageSuperUsers, password } =
      data;

    const exisitingSuperuser = await SuperUserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (exisitingSuperuser)
      return sendResponse(
        false,
        "Superuser with similar email or phone exisits",
        409
      );

    const [volunteer, cl, acl] = await Promise.all([
      VolunteerModel.findOne({ $or: [{ email }, { phone }] }),
      ClModel.findOne({ $or: [{ email }, { phone }] }),
      AclModel.findOne({ $or: [{ email }, { phone }] }),
    ]);

    if (volunteer || cl || acl) {
      return sendResponse(
        false,
        "Similar email or phone already exists in the system",
        409
      );
    }

    const newSuperUser = await SuperUserModel.create({
      firstName,
      lastName,
      email,
      phone,
      canManageSuperUsers,
      password
    })
    
    const createdSuperuser = await SuperUserModel.findById(newSuperUser._id).select("-password");
    if(!createdSuperuser)
      return sendResponse(false, "Error creating superuser", 500);

    return sendResponse(true, "Superuser created", 201, createdSuperuser)

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return sendResponse(false, errorMessage, 500);
  }
}
