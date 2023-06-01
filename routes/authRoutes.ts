import { FastifyInstance } from "fastify";
import { login, logout, refresh } from "../controllers/authController";
import {
  loginJsonSchema,
  refreshTokenJsonSchema,
} from "../schemas/authSchemas";

async function AuthRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: loginJsonSchema,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    login
  );
  fastify.post(
    "/refresh",
    {
      schema: refreshTokenJsonSchema,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    refresh
  );
  fastify.post(
    "/logout",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    logout
  );
}

export default AuthRoutes;
