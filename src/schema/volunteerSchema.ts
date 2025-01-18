import { Course, Year } from "@/types";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const imageFileSchema = z.custom<File>(
  (file) =>
    file instanceof File &&
    ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
  { message: "Invalid file type. Only PNG, JPEG, and JPG are allowed." }
);

export const volunteerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits long"),
  year: z.enum(Object.values(Year) as [string, ...string[]]),
  course: z.enum(Object.values(Course) as [string, ...string[]]),
  rollNo: z
    .string({ message: "Roll no is required" })
    .min(1, "Roll No is required"),
  preferredCommittee1: z.string().min(1, "Preferred Committee 1 is required"),
  preferredCommittee2: z.string().min(1, "Preferred Committee 2 is required"),
  preferredCommittee3: z.string().min(1, "Preferred Committee 3 is required"),
  partOfO2: z.string(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(15, "Password must be at most 60 characters long"),
  collegeId: imageFileSchema,
});
