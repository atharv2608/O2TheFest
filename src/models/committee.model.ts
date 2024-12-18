import mongoose, { Document, Schema } from "mongoose";

export interface Committee extends Document {
    committeeName: string;
    numberOfHeads: number;
    numberOfSubheads: number;
    numberOfVolunteers: number;
    isEventCommittee: boolean;
    numberOfEvents: number;
    colorCode: string;
    heads: mongoose.Types.ObjectId[]; 
    subheads: mongoose.Types.ObjectId[];  
    volunteers: mongoose.Types.ObjectId[];
    events: mongoose.Types.ObjectId[];
}

const CommitteeSchema: Schema<Committee> = new Schema({
    committeeName: {
        type: String,
        required: [true, "Committee Name is required"],
        unique: true,
    },
    numberOfHeads: {
        type: Number,
        required: [true, "Number of Heads is required"],
    },
    numberOfSubheads: {
        type: Number,
        required: [true, "Number of Subheads is required"],
    },
    numberOfVolunteers: {
        type: Number,
        required: [true, "Number of Volunteers is required"],
    },
    isEventCommittee: {
        type: Boolean,
        required: [true, "Is Event Committee is required"],
    },
    numberOfEvents: {
        type: Number,
        required: [true, "Number of Events is required"],
    },
    colorCode: {
        type: String,
        required: [true, "Color Code is required"],
        match: [/^#[0-9A-Fa-f]{6}$/, "Invalid Color Code! It should be in the format #RRGGBB."],
    },
    heads: [{
        type: Schema.Types.ObjectId,
        ref: "Volunteer",
    }],
    subheads: [{
        type: Schema.Types.ObjectId,
        ref: "Volunteer",
    }],
    volunteers: [{
        type: Schema.Types.ObjectId,
        ref: "Volunteer",
    }],
    events: [{
        type: Schema.Types.ObjectId,
        ref: "Event"
    }]
});

//Checks uniqueness of committee name regardless of the case
CommitteeSchema.index({ committeeName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const CommitteeModel = (mongoose.models.Committee as mongoose.Model<Committee>) || mongoose.model<Committee>("Committee", CommitteeSchema);

export default CommitteeModel;
