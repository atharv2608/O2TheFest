import {z} from "zod"

export const collegeSchema = z.object({
    collegeName: z.string().min(1, "College name is required"),
    location: z.string().min(1, "Location is required"),
    maxAcl: z.number().min(0, "Max ACL cannot be negative"),
})