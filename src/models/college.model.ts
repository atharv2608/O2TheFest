import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
export interface College extends Document {
  collegeName: string;
  location: string;
  ccCode: string;
  maxAcl: number;
  cl: mongoose.Types.ObjectId; // Reference to the CL  model
  acl: mongoose.Types.ObjectId[]; // References to ACL (Acl) models
  eventsRegistered: mongoose.Types.ObjectId[]; // Array of Event ObjectIds
  participants: mongoose.Types.ObjectId[]; // Array of Participant ObjectIds
  password: string; // External login is based on CC code and the password will be checked from here
  hasApplied: boolean;
  isApproved: boolean;
}

const CollegeSchema: Schema<College> = new Schema({
  collegeName: {
    type: String,
    required: [true, "College Name is required"],
    trim: true,
    unique: true,
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  ccCode: {
    type: String,
    trim: true,
  },
  maxAcl: {
    type: Number,
    required: [true, "Maximum ACL is required"],
    min: [0, "Max ACL cannot be negative"],
  },
  cl: {
    type: Schema.Types.ObjectId,
    ref: "Cl", // Reference to the CL model
  },
  acl: [
    {
      type: Schema.Types.ObjectId,
      ref: "Acl", // Reference to the ACL model
    },
  ],
  eventsRegistered: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event", // Reference to the Event model
    },
  ],
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "Participant", // Reference to the Participant model
    },
  ],
  password: {
    type: String,
    minlength: 6,
  },
  hasApplied:{
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  }
});

CollegeSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const CollegeModel =
  (mongoose.models.College as mongoose.Model<College>) ||
  mongoose.model<College>("College", CollegeSchema);

export default CollegeModel;
