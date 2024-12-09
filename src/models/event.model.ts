import mongoose, { Document, Schema } from "mongoose";
import { Level } from "@/types";

export interface Event extends Document {
    title: string;
    subtitle: string;
    description: string;
    rulesAndRegulations: string;
    podium: number;
    minParticipants: number;
    maxParticipants: number;
    slots: number;
    substitutions: number;
    level: Level;
    order: number;
    committee: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    date: Date;
    time: Date;

}

const EventSchema: Schema<Event> = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    subtitle: {
        type: String,
        required: [true, "Subtitle is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    rulesAndRegulations: {
        type: String,
        required: [true, "Rules and Regulations are required"],
    },
    podium: {
        type: Number,
        required: [true, "Podium number is required"],
    },
    minParticipants: {
        type: Number,
        required: [true, "Minimum Participants are required"],
    },
    maxParticipants: {
        type: Number,
        required: [true, "Maximum Participants are required"],
    },
    slots: {
        type: Number,
        required: [true, "Number of slots is required"],
    },
    substitutions: {
        type: Number,
        required: [true, "Number of substitutions is required"],
    },
    level: {
        type: String,
        required: [true, "Level is required"],
        enum: Object.values(Level), // Restrict to values from the Level enum
    },
    order: {
        type: Number,
        required: [true, "Order is required"],
    },
    committee: {
        type: Schema.Types.ObjectId,
        ref: "Committee",
        required: [true, "Committee is required"],
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "Participant",
    }],
    date: {
        type: Date,
        required: [true, "Event date is required"],
    },
    time: {
        type: Date,
        required: [true, "Event time is required"],
    },
});

// Add a unique case-insensitive index for the `title` field
EventSchema.index({ title: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const EventModel = (mongoose.models.Event as mongoose.Model<Event>) || mongoose.model<Event>("Event", EventSchema);

export default EventModel;
