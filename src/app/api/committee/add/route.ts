import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import CommitteeModel from "@/models/committee.model";
import { committeeSchema } from "@/schema/committeeSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Role } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return sendResponse(false, "Unauthenticated request", 401);

  if (session.user.role !== Role.SUPERUSER)
    return sendResponse(false, "Unauthorised request", 403);

  await dbConnect();
  try {
    const body = await req.json();
    const validation = committeeSchema.safeParse(body);

    if (!validation.success) {
      // Return the first validation error message
      return sendResponse(false, validation.error.issues[0].message, 400);
    }
    const {
      committeeName,
      numberOfHeads,
      numberOfSubheads,
      numberOfVolunteers,
      isEventCommittee,
      numberOfEvents,
      colorCode,
    } = body;

    //case insensitive checking
    const existingCommittee = await CommitteeModel.findOne({
      committeeName: { $regex: `^${committeeName}$`, $options: "i" },
    });

    if (existingCommittee)
      return sendResponse(false, "Committee Name already exists", 409);

    //check if someone tries to add number of events in non-event committee
    if (!isEventCommittee && numberOfEvents > 0)
      return sendResponse(
        false,
        "Event count in non-event committee must be zero",
        400
      );

    if (isEventCommittee && numberOfEvents <= 0)
      return sendResponse(
        false,
        "Number of events should be greater than zero",
        400
      );

    const newCommittee = await CommitteeModel.create({
      committeeName,
      numberOfHeads,
      numberOfSubheads,
      numberOfVolunteers,
      isEventCommittee,
      numberOfEvents,
      colorCode: colorCode || (process.env.DEFAULT_COLOR_CODE as string), //default color code when no color code is specified
    });

    const createdCommittee = await CommitteeModel.findById(newCommittee._id);

    if (!createdCommittee)
      return sendResponse(false, "Failed to create committee", 500);

    return sendResponse(true, "Created committee", 201, createdCommittee);
  } catch (error) {
    console.error("Error creating committee: ", error);
    return sendResponse(
      false,
      "Failed to create committee. Please try again later",
      500
    );
  }
}
