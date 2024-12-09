import mongoose, { Document, Schema } from "mongoose";

export enum ParticipantType {
  OTSE = "otse",
  NORMAL = "normal"
}

export interface Participant extends Document {
  participantName: string;
  phone: string;
  participantType: ParticipantType;
  eventsRegistered: mongoose.Types.ObjectId[]; // Array of event ObjectIds
  college: mongoose.Types.ObjectId; // Reference to College
}

const ParticipantSchema: Schema<Participant> = new Schema({
  participantName: {
    type: String,
    required: [true, "Participant name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  participantType: {
    type: String,
    required: [true, "Participant type is required"],
    enum: Object.values(ParticipantType), // Only "otse" or "normal" allowed
  },
  eventsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // Assuming "Event" is the model for the event, adjust accordingly
  }],
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College", // Reference to the College model
    required: true,
  },
});

const ParticipantModel = (mongoose.models.Participant as mongoose.Model<Participant>) || mongoose.model<Participant>("Participant", ParticipantSchema);

export default ParticipantModel;
