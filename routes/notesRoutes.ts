import { FastifyInstance, FastifySchema } from "fastify";
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController";
import {
  createNewNoteJsonSchema,
  updateNoteJsonSchema,
  deleteNoteJsonSchema,
  CreateNewNoteType,
} from "../schemas/notesSchemas";

async function NotesRoutes(fastify: FastifyInstance) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, getAllNotes);
  fastify.post<{
    Body: CreateNewNoteType;
  }>(
    "/",
    { preHandler: [fastify.authenticate], schema: createNewNoteJsonSchema },
    createNewNote
  );
  fastify.patch("/", { schema: updateNoteJsonSchema }, updateNote);
  fastify.delete("/", { schema: deleteNoteJsonSchema }, deleteNote);
}

export default NotesRoutes;
