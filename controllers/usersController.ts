import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import {
  CreateNewUserType,
  UpdateUserType,
  DeleteUserType,
} from "../schemas/userSchemas";
import { applicationRoles } from "../lib/allowedRoles";

//@desc Get all users
//@route GET /users
//@access Private

export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (request.user.role !== applicationRoles.ADMIN) {
    return reply.status(403).send({ message: "Forbidden" });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      active: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!users || !users.length) {
    return reply.status(400).send({ message: "No users found" });
  }
  return reply.send(users);
};

//@desc Create new user
//@route POST /users
//@access Private

export const createNewUser = async (
  request: FastifyRequest<{
    Body: CreateNewUserType;
  }>,
  reply: FastifyReply
) => {
  const { username, password, role } = request.body;
  if (request.user.role !== applicationRoles.ADMIN) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  const duplicate = await prisma.user.findMany({
    where: {
      username: username,
    },
  });

  if (duplicate.length) {
    return reply.code(409).send({ message: "Duplicate user name" });
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPassword, role };

  //create and store new user
  const user = await prisma.user.create({
    data: userObject,
  });

  if (user) {
    return reply
      .code(201)
      .send({ message: `New user ${user.username} created` });
  } else {
    return reply.code(400).send({ message: "Invalid user data received" });
  }
};

//@desc Update a user
//@route PATCH /users
//@access Private

export const updateUser = async (
  request: FastifyRequest<{
    Body: UpdateUserType;
  }>,
  reply: FastifyReply
) => {
  const { id, username, password, role, active } = request.body;
  if (request.user.role !== applicationRoles.ADMIN) {
    return reply.status(403).send({ message: "Forbidden" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return reply.code(400).send({ message: "User not found" });
  }

  //Check if a username is provided, then check if its already in use
  if (username) {
    const duplicate = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (duplicate) {
      return reply.code(409).send({ message: "Duplicate user name" });
    }
  }

  if (active) user.active = active;
  if (role) user.role = role;
  if (username) user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: user,
  });

  return reply.send({ message: `${updatedUser.username} has been updated` });
};

//@desc Delete a user
//@route DELETE /users
//@access Private

export const deleteUser = async (
  request: FastifyRequest<{
    Body: DeleteUserType;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.body;
  if (request.user.role !== applicationRoles.ADMIN) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  const notes = await prisma.note.findMany({
    where: {
      userId: id,
    },
  });
  if (notes.length) {
    return reply.code(400).send({ message: "User has assigned notes" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return reply.code(400).send({ message: "User not found" });
  }

  const result = await prisma.user.delete({
    where: {
      id: id,
    },
  });

  return reply.send({ message: `${result.username} has been deleted` });
};
