import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const createNewUserBodySchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(["EMPLOYEE", "ADMIN", "MANAGER"]),
});

const updateUserBodySchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["EMPLOYEE", "ADMIN", "MANAGER"]).optional(),
  active: z.boolean().optional(),
});

const deleteUserBodySchema = z.object({
  id: z.string(),
});

export type CreateNewUserType = z.infer<typeof createNewUserBodySchema>;
export type UpdateUserType = z.infer<typeof updateUserBodySchema>;
export type DeleteUserType = z.infer<typeof deleteUserBodySchema>;

export const createNewUserJsonSchema = {
  body: zodToJsonSchema(createNewUserBodySchema, "createNewUserBodySchema"),
};

export const updateUserJsonSchema = {
  body: zodToJsonSchema(updateUserBodySchema, "updateUserBodySchema"),
};

export const deleteUserJsonSchema = {
  body: zodToJsonSchema(deleteUserBodySchema, "deleteUserBodySchema"),
};
