import { FastifyInstance } from "fastify";
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/usersController";
import {
  createNewUserJsonSchema,
  updateUserJsonSchema,
  deleteUserJsonSchema,
} from "../schemas/userSchemas";

async function UserRoutes(fastify: FastifyInstance) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, getAllUsers);
  fastify.post("/", { schema: createNewUserJsonSchema }, createNewUser);
  fastify.patch("/", { schema: updateUserJsonSchema }, updateUser);
  fastify.delete("/", { schema: deleteUserJsonSchema }, deleteUser);
}

export default UserRoutes;
