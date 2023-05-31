import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";

const acceptedRoles = ["EMPLOYEE", "ADMIN", "MANAGER"];

//@desc Get all users
//@route GET /users
//@access Private

export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      active: true,
      notes: true,
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
    Body: {
      username: string;
      password: string;
      role: "EMPLOYEE" | "ADMIN" | "MANAGER";
    };
  }>,
  reply: FastifyReply
) => {
  const { username, password, role } = request.body;
  const duplicate = await prisma.user.findMany({
    where: {
      username: username,
    },
  });

  if (duplicate.length) {
    return reply.code(409).send({ message: "Duplicate user name" });
  }

  if (!acceptedRoles.includes(role)) {
    return reply.code(400).send({ message: "Invalid role name" });
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
    Body: {
      id: string;
      username: string;
      password?: string;
      role: "EMPLOYEE" | "ADMIN" | "MANAGER";
      active: boolean;
    };
  }>,
  reply: FastifyReply
) => {
  const { id, username, password, role, active } = request.body;

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  const duplicate = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    return reply.code(400).send({ message: "User not found" });
  }

  if (duplicate) {
    return reply.code(409).send({ message: "Duplicate user name" });
  }

  user.username = username;
  user.role = role;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

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
    Body: {
      id: string;
    };
  }>,
  reply: FastifyReply
) => {
  const { id } = request.body;
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
