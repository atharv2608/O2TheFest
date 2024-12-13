import { z } from "zod";

export const superUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits long"),
  canManageSuperUsers: z.boolean({
    message: "Can manage superUser flag is required",
  }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(25, "Password must be at most 25 characters long"),
});
