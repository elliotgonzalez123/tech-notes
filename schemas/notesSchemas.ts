import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createNewNoteBodySchema = z.object({
  title: z.string(),
  text: z.string(),
  userId: z.string().optional(),
});

const updateNoteBodySchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  text: z.string().optional(),
  completed: z.boolean().optional(),
});

const deleteNoteBodySchema = z.object({
  id: z.number(),
});

export type CreateNewNoteType = z.infer<typeof createNewNoteBodySchema>;
export type UpdateNoteType = z.infer<typeof updateNoteBodySchema>;
export type DeleteNoteType = z.infer<typeof deleteNoteBodySchema>;

export const createNewNoteJsonSchema = {
  body: zodToJsonSchema(createNewNoteBodySchema, "createNewNoteBodySchema"),
};

export const updateNoteJsonSchema = {
  body: zodToJsonSchema(updateNoteBodySchema, "updateUserJsonSchema"),
};

export const deleteNoteJsonSchema = {
  body: zodToJsonSchema(deleteNoteBodySchema, "deleteNoteBodySchema"),
};
