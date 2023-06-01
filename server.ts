import { config } from "dotenv";
import Fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { RootRoute } from "./routes/root";
import path from "path";
import cors from "@fastify/cors";
import { corsOptions } from "./config/corsOptions";
import prisma from "./utils/prisma";
import UserRoutes from "./routes/userRoutes";
import NotesRoutes from "./routes/notesRoutes";
import AuthRoutes from "./routes/authRoutes";
import jwtAuthPlugin from "./plugins";
import fastifyRedis = require("@fastify/redis");

config();

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

const environment: Environment = process.env.NODE_ENV as Environment;

export const fastify: FastifyInstance = Fastify({
  logger: envToLogger[environment] ?? true,
});

//cors
fastify.register(cors, corsOptions);

//rate limiter applied to /auth routes
fastify.register(fastifyRateLimit, {
  global: false,
  max: 5,
  timeWindow: "1 minute",
  errorResponseBuilder(req, context) {
    return {
      code: 429,
      error: "Too many requests",
      message:
        "Too many login attempts from this IP, please try again after a 60 second pause",
      date: Date.now(),
      expiresIn: context.ttl,
    };
  },
});

//auth "middleware" (plugin)
fastify.register(jwtAuthPlugin);

//redis for refresh_token rotation
fastify.register(fastifyRedis, {
  host: process.env.REDISHOST!,
  password: process.env.REDISPASSWORD!,
  port: 5670,
  url: process.env.REDIS_URL!,
});

//static files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
});

//routes
fastify.register(RootRoute, { prefix: "/" });
fastify.register(UserRoutes, { prefix: "/users" });
fastify.register(NotesRoutes, { prefix: "/notes" });
fastify.register(AuthRoutes, { prefix: "/auth" });

//404
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  if (request.headers.accept?.includes("text/html")) {
    reply.code(404).sendFile("views/404.html");
  } else {
    reply.code(404).send({ message: "404 Not found" });
  }
});

//start server
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
  await prisma.$disconnect();
  fastify.redis.disconnect();
  process.exit(0);
};

process.on("SIGINT", exitHandler);
process.on("SIGTERM", exitHandler);

start();
