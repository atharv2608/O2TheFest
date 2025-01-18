import { z } from "zod";
import { imageFileSchema } from "./volunteerSchema";

export const clSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Invalid Email" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits long"),
  collegeId: imageFileSchema,
  college: z.string().min(1, { message: "College is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});
