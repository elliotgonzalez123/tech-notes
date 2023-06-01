import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import fastifyPlugin from "fastify-plugin";

type User = {
  user: {
    id: string;
    username: string;
    role: string;
  };
  iat: number;
  exp: number;
};

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      username: string;
      role: string;
      iat: number;
      exp: number;
    };
  }
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

const jwtAuthPlugin = async (fastify: FastifyInstance) => {
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader?.startsWith("Bearer ")) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET!
        ) as User;
        request.user = {
          id: decoded.user.id,
          username: decoded.user.username,
          role: decoded.user.role,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      } catch (error) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    }
  );
};

export default fastifyPlugin(jwtAuthPlugin);
