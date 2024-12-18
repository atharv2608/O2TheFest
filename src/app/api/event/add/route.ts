import dbConnect from "@/lib/dbConnect";
import { sendResponse } from "@/lib/sendResponse";
import CommitteeModel from "@/models/committee.model";
import EventModel from "@/models/event.model";
import { eventSchema } from "@/schema/eventSchema";
import mongoose from "mongoose";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return sendResponse(false, validation.error.issues[0].message, 400);
    }

    const {
      title,
      subtitle,
      description,
      rulesAndRegulations,
      podium,
      minParticipants,
      maxParticipants,
      slots,
      substitutions,
      level,
      order,
      committee_id,
      date,
      time,
    } = body;

    // Fetch committee and perform event checks in a single call
    const [committee, existingEvents] = await Promise.all([
      CommitteeModel.findById(committee_id),
      EventModel.find({
        $or: [
          { title: { $regex: `^${title}$`, $options: "i" } },
          { order },
          { committee: committee_id },
        ],
      }).lean(),
    ]);

    // Check if committee exists
    if (!committee) return sendResponse(false, "Committee not found", 404);

    //Check if someone tries to add event in non event committee
    if(!committee.isEventCommittee) return sendResponse(false, "Cannot add events in non event committee", 400);

    // Extract and categorize the existing events
    const eventWithSameTitle = existingEvents.find(
      (event) => event.title.toLowerCase() === title.toLowerCase()
    );
    const eventWithSameOrder = existingEvents.find(
      (event) => event.order === order
    );
    const committeeEventCount = existingEvents.filter(
      (event) => event.committee.toString() === committee_id
    ).length;

    // Check if the number of events limit has been reached
    if (committeeEventCount >= committee.numberOfEvents)
      return sendResponse(false, "Event limit reached", 409);

    // Check if event with similar title exists
    if (eventWithSameTitle)
      return sendResponse(false, "Event with similar title exists", 409);

    // Check if other event has the same order
    if (eventWithSameOrder)
      return sendResponse(false, "Event with same order exists", 409);

    // Create the event
    const newEvent = await EventModel.create({
      title,
      subtitle,
      description,
      rulesAndRegulations,
      podium,
      minParticipants,
      maxParticipants,
      slots,
      substitutions,
      level,
      order,
      committee: committee_id,
      date: date || null,
      time: time || null,
    });
    
    if (!newEvent) return sendResponse(false, "Failed to create event", 500);
    committee.events.push(new mongoose.Types.ObjectId(newEvent._id as string));
    await committee.save();
    return sendResponse(true, "Created event", 201, newEvent);
  } catch (error) {
    console.error("Error creating event: ", error);
    return sendResponse(
      false,
      "Failed to create event. Please try again later",
      500
    );
  }
}
