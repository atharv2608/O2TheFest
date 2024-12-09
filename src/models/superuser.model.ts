import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
export interface Superuser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "superuser";
    canManageSuperUsers: boolean;
    password: string;
}

const SuperuserSchema: Schema<Superuser> = new Schema({
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
        unique: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        default: "superuser", // Default is superuser, no need to change
        enum: ["superuser"], // Role is strictly "superuser"
    },
    canManageSuperUsers: {
        type: Boolean,
        required: true,
        default: false, // Default to false; can be set to true if this superuser can manage other superusers
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
});

SuperuserSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

SuperuserSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

const SuperUserModel = (mongoose.models.Superuser as mongoose.Model<Superuser>) || mongoose.model<Superuser>("Superuser", SuperuserSchema);

export default SuperUserModel;
