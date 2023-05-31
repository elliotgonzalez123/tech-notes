import { FastifyInstance, FastifySchema } from "fastify";
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/usersController";

const createNewUserSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
      role: { type: "string" },
    },
    required: ["username", "password", "role"],
  },
};

const updateUserSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      password: { type: "string" },
      role: { type: "string" },
      active: { type: "boolean" },
    },
    required: ["id", "username", "role", "active"],
  },
};

const deleteUserSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
};

async function UserRoutes(fastify: FastifyInstance) {
  fastify.get("/", getAllUsers);
  fastify.post("/", { schema: createNewUserSchema }, createNewUser);
  fastify.patch("/", { schema: updateUserSchema }, updateUser);
  fastify.delete("/", { schema: deleteUserSchema }, deleteUser);
}

export default UserRoutes;
