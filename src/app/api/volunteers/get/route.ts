import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import VolunteerModel from "@/models/volunteer.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  await dbConnect();

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
                committeeName: "$$committee.committeeName"
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          __v: 0
        }
      }
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