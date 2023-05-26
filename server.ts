import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyStatic from "@fastify/static";
import { RootRoute } from "./routes/root";
import path from "path";
import cors from "@fastify/cors";
import { corsOptions } from "./config/corsOptions";

type Environment = "development" | "production" | "test";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

// const environment: Environment = process.env.NODE_ENV as Environment;
const environment: Environment = "development";

const fastify: FastifyInstance = Fastify({
  logger: envToLogger[environment] ?? true,
});

fastify.register(cors, corsOptions);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  //   prefix: "/views/", // optional: default '/'
});

fastify.register(RootRoute, { prefix: "/" });

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  if (request.headers.accept?.includes("text/html")) {
    reply.code(404).sendFile("views/404.html");
  } else {
    reply.code(404).send({ message: "404 Not found" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: "0.0.0.0" });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

//Graceful shutdown
const exitHandler = async (signal: NodeJS.Signals) => {
  console.log(`Received signal to terminate: ${signal}`);

  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", exitHandler);
process.on("SIGTERM", exitHandler);

start();
