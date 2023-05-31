import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import {
  CreateNewNoteType,
  UpdateNoteType,
  DeleteNoteType,
} from "../schemas/notesSchemas";

//@desc Get all notes
//@route GET /notes
//@access Private

export const getAllNotes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const notes = await prisma.note.findMany();

  if (!notes || !notes.length) {
    return reply.code(400).send({ message: "No notes found" });
  }

  return reply.send(notes);
};

//@desc Create new note
//@route POST /notes
//@access Private

export const createNewNote = async (
  request: FastifyRequest<{
    Body: CreateNewNoteType;
  }>,
  reply: FastifyReply
) => {
  const { title, text, userId } = request.body;
  const newNote = await prisma.note.create({
    data: {
      title,
      text,
      userId,
    },
  });

  if (newNote) {
    return reply
      .code(201)
      .send({ message: `New note ${newNote.title} created` });
  } else {
    return reply.code(400).send({ message: "Invalid note data received" });
  }
};

//@desc Update a note
//@route PATCH /note
//@access Private

export const updateNote = async (
  request: FastifyRequest<{
    Body: UpdateNoteType;
  }>,
  reply: FastifyReply
) => {
  const { id, title, text, completed } = request.body;

  const note = await prisma.note.findUnique({
    where: {
      id: id,
    },
  });

  if (!note) {
    return reply.code(400).send({ message: "Note cannot be found" });
  }

  if (title) note.title = title;
  if (text) note.text = text;
  if (completed) note.completed = completed;

  const updatedNote = await prisma.note.update({
    where: {
      id: id,
    },
    data: note,
  });

  return reply.send(`${updatedNote.title} has been updated`);
};

//@desc Delete a user
//@route DELETE /users
//@access Private

export const deleteNote = async (
  request: FastifyRequest<{
    Body: DeleteNoteType;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.body;

  const note = await prisma.note.findUnique({
    where: {
      id: id,
    },
  });

  if (!note) {
    return reply.code(400).send({ message: "Note cannot be found" });
  }

  const deletedNote = await prisma.note.delete({
    where: {
      id: id,
    },
  });

  return reply.send({ message: `${deletedNote.title} has been deleted` });
};
