import { z } from "zod";

export const committeeSchema = z.object({
  committeeName: z.string().min(1, "Committee name is required"),
  numberOfHeads: z
    .number({ message: "Number of heads is required" })
    .min(1, "Number of heads must be greater than zero"),
  numberOfSubheads: z
    .number({ message: "Number of subheads is required" })
    .min(1, "Number of subheads must be greater than zero"),
  numberOfVolunteers: z
    .number()
    .min(1, "Number of volunteers must be greater than zero"),
  isEventCommittee: z.boolean({ message: "Event Committee Flag is required" }),
  numberOfEvents: z.number({ message: "Number of events is required" }).min(0),
  colorCode: z.string().optional(),
});
