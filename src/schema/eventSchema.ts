import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().min(1, "Event title is required"),
    subtitle: z.string().min(1, "Event subtitle is required"),
    description: z.string().min(1, "Event description is required"),
    rulesAndRegulations: z
      .string()
      .min(1, "Event rules and regulations are required"),
    podium: z
      .number()
      .min(1, "Podium must be between 1 and 3")
      .max(3, "Podium must be between 1 and 3"),
    minParticipants: z
      .number()
      .min(1, "Minimum number of participants is required"),
    maxParticipants: z
      .number()
      .min(1, "Maximum number of participants is required"),
    slots: z.number().min(1, "Slots is required"),
    substitutions: z.number(),
    level: z.enum(["flagship", "non-flagship"]),
    order: z.number(),
    committee_id: z.string().min(1, "Committee Id is required"),
    date: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().optional()
    ),
    time: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().optional()
    ),
  })
  .refine((data) => data.minParticipants <= data.maxParticipants, {
    message: "Minimum participants cannot exceed maximum participants",
    path: ["minParticipants"],
  });
