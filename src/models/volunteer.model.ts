import { Course, Role, Year } from "@/types";
import mongoose, {Document, Schema} from "mongoose"
import bcrypt from "bcrypt";

export interface Volunteer extends Document{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    year: Year;
    course: Course;
    rollNo: string;
    preferredCommittees: mongoose.Types.ObjectId[];
    partOfO2: boolean;
    collegeId: string;
    committee: mongoose.Types.ObjectId[];
    role: Role;
    pending: boolean;
    shortlisted: boolean;
    approved: boolean;
    rejected: boolean;
    password: string;
    isPasswordCorrect(password: string): Promise<boolean>
}

const VolunteerSchema: Schema<Volunteer> = new Schema({
    firstName:{
        type: String,
        required: [true, "First Name is required"]
    },
    lastName:{
        type: String,
        required: [true, "Last Name is required"]
    },
    email:{
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
        unique: true,
        lowercase: true,
        trim: true,
    },
    year:{
        type: String,
        required: [true, "Year is required"],
        enum: Object.values(Year)
    },
    course: {
        type: String,
        required: [true, "Course is required"],
        enum: Object.values(Course)
    },
    rollNo:{
        type: String,
        required: [true, "Roll No is required"],
        lowercase: true
    },
    preferredCommittees: [{ 
        type: Schema.Types.ObjectId,
        ref: "Committee"
    }],
    partOfO2: {
        type: Boolean,
        default: false,
        required: true,
    },
    collegeId: {
        type: String,
        required: [true, "College Id is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, "Invalid College Id URL!"],
    },
    committee: [{
        type: Schema.Types.ObjectId,
        ref: "Committee"
    }],
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: Object.values(Role),
        lowercase: true,
        default: Role.VOLUNTEER
    },
    pending: {
        type: Boolean,
        default: true,
        required: true,
    },
    shortlisted: {
        type: Boolean,
        default: false,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
        required: true,
    },
    rejected: {
        type: Boolean,
        default: false,
        required: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    }
})

VolunteerSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

VolunteerSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}
const VolunteerModel = (mongoose.models.Volunteer as mongoose.Model<Volunteer>) || mongoose.model<Volunteer>("Volunteer", VolunteerSchema);

export default VolunteerModel;