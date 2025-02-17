import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import CommitteeModel from "@/models/committee.model";
import VolunteerModel from "@/models/volunteer.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Role } from "@/types";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return sendResponse(false, "Unauthenticated request", 401);

  if (session.user.role !== Role.SUPERUSER)
    return sendResponse(false, "Unauthorised request", 403);

  await dbConnect();
  try {
    // Get committee ID from URL or request body
    const { committeeId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return sendResponse(false, "Invalid committee ID", 400);
    }

    // Find the committee and populate events
    const committee = await CommitteeModel.findById(committeeId)
      .populate('events')
      .populate('heads')
      .populate('subheads')
      .populate('volunteers');

    if (!committee) {
      return sendResponse(false, "Committee not found", 404);
    }

    // Check if committee has any events
    if (committee.events.length > 0) {
      return sendResponse(
        false,
        "Cannot delete committee with existing events. Please delete all events first.",
        400
      );
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove committee reference from all volunteers who have this committee
      await VolunteerModel.updateMany(
        { committee: committeeId },
        { $pull: { committee: committeeId } },
        { session }
      );

      // Remove committee reference from all volunteers who have this in preferred committees
      await VolunteerModel.updateMany(
        { preferredCommittees: committeeId },
        { $pull: { preferredCommittees: committeeId } },
        { session }
      );

      // Delete the committee
      await CommitteeModel.findByIdAndDelete(committeeId, { session });

      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }

    return sendResponse(true, "Committee deleted successfully", 200, {
      deletedCommittee: committee,
      affectedVolunteers: {
        heads: committee.heads.length,
        subheads: committee.subheads.length,
        volunteers: committee.volunteers.length
      }
    });

  } catch (error) {
    console.error("Error deleting committee: ", error);
    return sendResponse(
      false,
      "Failed to delete committee. Please try again later",
      500
    );
  }
}