import { z } from "zod";

export const sheetSubmissionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be at most 80 characters."),
  role: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters.")
    .max(80, "Role must be at most 80 characters."),
});

export type SheetSubmissionFormValues = z.infer<
  typeof sheetSubmissionFormSchema
>;
