import mongoose, { Document, Schema } from "mongoose";

export interface Acl extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  collegeId: string;
  role: "acl";
  college: mongoose.Types.ObjectId; // Reference to the College model
}

const AclSchema: Schema<Acl> = new Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
    trim: true,
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
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, "Invalid College ID URL!"],
  },
  role: {
    type: String,
    required: true,
    default: "acl", // Default is "acl"
    enum: ["acl"], // Role is strictly "acl"
  },
  college: {
    type: Schema.Types.ObjectId,  // Use Schema.Types.ObjectId for referencing the College model
    ref: "College", // Reference to the College model
    required: true,
  },
});


const AclModel = (mongoose.models.Acl as mongoose.Model<Acl>) || mongoose.model<Acl>("Acl", AclSchema);

export default AclModel;
