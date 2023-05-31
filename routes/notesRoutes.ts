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
} from "../schemas/notesSchemas";

async function NotesRoutes(fastify: FastifyInstance) {
  fastify.get("/", getAllNotes);
  fastify.post("/", { schema: createNewNoteJsonSchema }, createNewNote);
  fastify.patch("/", { schema: updateNoteJsonSchema }, updateNote);
  fastify.delete("/", { schema: deleteNoteJsonSchema }, deleteNote);
}

export default NotesRoutes;
