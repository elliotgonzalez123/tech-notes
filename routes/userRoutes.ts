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
  CreateNewUserType,
  UpdateUserType,
  DeleteUserType,
} from "../schemas/userSchemas";

async function UserRoutes(fastify: FastifyInstance) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, getAllUsers);
  fastify.post<{ Body: CreateNewUserType }>(
    "/",
    { preHandler: [fastify.authenticate], schema: createNewUserJsonSchema },
    createNewUser
  );
  fastify.patch<{ Body: UpdateUserType }>(
    "/",
    { preHandler: [fastify.authenticate], schema: updateUserJsonSchema },
    updateUser
  );
  fastify.delete<{ Body: DeleteUserType }>(
    "/",
    { preHandler: [fastify.authenticate], schema: deleteUserJsonSchema },
    deleteUser
  );
}

export default UserRoutes;
