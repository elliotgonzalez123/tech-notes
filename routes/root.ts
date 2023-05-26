import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import path from "path";

export async function RootRoute(fastify: FastifyInstance) {
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.sendFile("views/index.html");
  });
}
