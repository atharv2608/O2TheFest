import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import VolunteerModel from "@/models/volunteer.model";
import { User } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  // const user: User = session?.user as User;
  if (!session || !session.user) {
    return sendResponse(false, "Unauthenticated request", 401);
  }
  try {
    const volunteers = await VolunteerModel.aggregate([
      {
        $lookup: {
          from: "committees",
          localField: "preferredCommittees",
          foreignField: "_id",
          as: "preferredCommittees",
        },
      },
      {
        $addFields: {
          preferredCommittees: {
            $map: {
              input: "$preferredCommittees",
              as: "committee",
              in: {
                _id: "$$committee._id",
                committeeName: "$$committee.committeeName",
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);

    if (!volunteers) {
      return sendResponse(false, "Volunteers not found", 404);
    }
    return sendResponse(
      true,
      "Volunteers fetched successfully",
      200,
      volunteers
    );
  } catch (error) {
    console.error("Error fetching volunteers: ", error);
    return sendResponse(false, "Error fetching volunteers", 500);
  }
}
