import mongoose, { Document, Schema } from "mongoose";

// Assuming the models for College, CL (College Leader), and Participant are already defined
// If not, they should be created similar to the previous models.

export interface Substitution extends Document {
  event: mongoose.Types.ObjectId; // Reference to the Event model
  college: mongoose.Types.ObjectId; // Reference to the College model
  substitutedBy: mongoose.Types.ObjectId; // Reference to the CL model
  participantIn: mongoose.Types.ObjectId; // Reference to the Participant model (the new participant)
  participantOut: mongoose.Types.ObjectId; // Reference to the Participant model (the old participant)
}

const SubstitutionSchema: Schema<Substitution> = new Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // Reference to Event model
    required: true,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College", // Reference to College model
    required: true,
  },
  substitutedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CL", // Reference to CL (College Leader) model
    required: true,
  },
  participantIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant", // Reference to Participant model (new participant)
    required: true,
  },
  participantOut: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant", // Reference to Participant model (old participant)
    required: true,
  },
});

const SubstitutionModel = (mongoose.models.Substitution as mongoose.Model<Substitution>) || mongoose.model<Substitution>("Substitution", SubstitutionSchema);

export default SubstitutionModel;
