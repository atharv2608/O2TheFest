import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import CommitteeModel from "@/models/committee.model";
import VolunteerModel from "@/models/volunteer.model";
import { committeeSchema } from "@/schema/committeeSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Role } from "@/types";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return sendResponse(false, "Unauthenticated request", 401);

  if (session.user.role !== Role.SUPERUSER)
    return sendResponse(false, "Unauthorised request", 403);

  await dbConnect();
  try {
    const body = await req.json();
    const { committeeId, ...updateData } = body;

    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return sendResponse(false, "Invalid committee ID", 400);
    }

    const validation = committeeSchema.safeParse(updateData);
    if (!validation.success) {
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
    } = updateData;

    // Find the committee to update
    const existingCommittee = await CommitteeModel.findById(committeeId);
    if (!existingCommittee) {
      return sendResponse(false, "Committee not found", 404);
    }

    // Check if another committee exists with the same name (excluding current committee)
    const duplicateCommittee = await CommitteeModel.findOne({
      _id: { $ne: committeeId },
      committeeName: { $regex: `^${committeeName}$`, $options: "i" },
    });

    if (duplicateCommittee) {
      return sendResponse(false, "Committee Name already exists", 409);
    }

    // Check current number of volunteers with this committee in their array
    const currentVolunteers = await VolunteerModel.countDocuments({
      committee: { $in: [committeeId] },
      role: Role.VOLUNTEER,
    });

    if (currentVolunteers > numberOfVolunteers) {
      return sendResponse(
        false,
        `Cannot reduce volunteer limit. Current volunteer count (${currentVolunteers}) exceeds new limit (${numberOfVolunteers})`,
        400
      );
    }

    // Check current number of heads with this committee in their array
    const currentHeads = await VolunteerModel.countDocuments({
      committee: { $in: [committeeId] },
      role: Role.HEAD,
    });

    if (currentHeads > numberOfHeads) {
      return sendResponse(
        false,
        `Cannot reduce head limit. Current head count (${currentHeads}) exceeds new limit (${numberOfHeads})`,
        400
      );
    }

    // Check current number of subheads with this committee in their array
    const currentSubheads = await VolunteerModel.countDocuments({
      committee: { $in: [committeeId] },
      role: Role.SUBHEAD,
    });

    if (currentSubheads > numberOfSubheads) {
      return sendResponse(
        false,
        `Cannot reduce subhead limit. Current subhead count (${currentSubheads}) exceeds new limit (${numberOfSubheads})`,
        400
      );
    }

    // Check event committee constraints
    if (!isEventCommittee && numberOfEvents > 0) {
      return sendResponse(
        false,
        "Event count in non-event committee must be zero",
        400
      );
    }

    if (isEventCommittee && numberOfEvents <= 0) {
      return sendResponse(
        false,
        "Number of events should be greater than zero",
        400
      );
    }

    // Update the committee
    const updatedCommittee = await CommitteeModel.findByIdAndUpdate(
      committeeId,
      {
        committeeName,
        numberOfHeads,
        numberOfSubheads,
        numberOfVolunteers,
        isEventCommittee,
        numberOfEvents,
        colorCode: colorCode || (process.env.DEFAULT_COLOR_CODE as string),
      },
      { new: true }
    );

    if (!updatedCommittee) {
      return sendResponse(false, "Failed to update committee", 500);
    }

    return sendResponse(true, "Committee updated successfully", 200, updatedCommittee);
  } catch (error) {
    console.error("Error updating committee: ", error);
    return sendResponse(
      false,
      "Failed to update committee. Please try again later",
      500
    );
  }
}