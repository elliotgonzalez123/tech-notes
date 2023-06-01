import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const loginBodySchema = z.object({
  username: z.string(),
  password: z.string(),
});

const refreshTokenBodySchema = z.object({
  refresh_token: z.string(),
});

export type LoginType = z.infer<typeof loginBodySchema>;
export type RefreshTokenType = z.infer<typeof refreshTokenBodySchema>;

export const loginJsonSchema = {
  body: zodToJsonSchema(loginBodySchema, "loginBodySchema"),
};

export const refreshTokenJsonSchema = {
  body: zodToJsonSchema(refreshTokenBodySchema, "refreshTokenBodySchema"),
};
