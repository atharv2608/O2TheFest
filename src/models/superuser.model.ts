import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
export interface SuperUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "superUser";
    canManageSuperUsers: boolean;
    password: string;
    isPasswordCorrect(password: string): Promise<boolean>;
}

const SuperUserSchema: Schema<SuperUser> = new Schema({
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
        default: "superUser", // Default is superuser, no need to change
        enum: ["superUser"], // Role is strictly "superuser"
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

SuperUserSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

SuperUserSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

const SuperUserModel = (mongoose.models.SuperUser as mongoose.Model<SuperUser>) || mongoose.model<SuperUser>("SuperUser", SuperUserSchema);

export default SuperUserModel;
