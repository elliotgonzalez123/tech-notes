import { allowedOrigins } from "./allowedOrigins";
import { FastifyCorsOptions } from "@fastify/cors";

export const corsOptions: FastifyCorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
