import { UserType } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

export interface Cl extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  collegeId: string;
  role: "cl";
  college: mongoose.Types.ObjectId; // Reference to the college object;
  userType: UserType.EXTERNAL
}

const ClSchema: Schema<Cl> = new Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, "Invalid email!"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
  },
  collegeId: {
    type: String,
    required: [true, "College ID is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, "Invalid College ID URL!"], // URL pattern
  },
  role: {
    type: String,
    required: true,
    default: "cl",
    enum: ["cl"], // Strictly for 'cl' role
  },
  college: {
    type: Schema.Types.ObjectId,
    ref: "College", 
    required: [true, "College is required"],
  },
  userType:{
    type: String,
    default: UserType.EXTERNAL,
  }
});

const ClModel = (mongoose.models.Cl as mongoose.Model<Cl>) || mongoose.model<Cl>("Cl", ClSchema);

export default ClModel;
