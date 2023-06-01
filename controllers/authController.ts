import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import { LoginType, RefreshTokenType } from "../schemas/authSchemas";
import jwt from "jsonwebtoken";
import { fastify } from "../server";

//@desc Login
//@route POST /auth
//@access Public

export const login = async (
  request: FastifyRequest<{ Body: LoginType }>,
  reply: FastifyReply
) => {
  const { username, password } = request.body;
  const foundUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!foundUser || !foundUser.active) {
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const match = bcrypt.compare(password, foundUser.password);
  if (!match) {
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const access_token = jwt.sign(
    {
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  const refresh_token = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "1d",
    }
  );

  //save refresh_token to DB
  fastify.redis.set(username, refresh_token);

  return reply.send({
    access_token,
    refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });
};

//@desc Refresh
//@route GET /auth/refresh
//@access Public
type DecodedRefreshToken = {
  username: string;
};
export const refresh = async (
  request: FastifyRequest<{
    Body: RefreshTokenType;
  }>,
  reply: FastifyReply
) => {
  const { refresh_token } = request.body;
  if (!refresh_token) return reply.code(401).send({ message: "Unauthorized" });
  const token = refresh_token;
  return jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN_SECRET!,
    async (error, decoded) => {
      if (error) return reply.code(403).send({ message: "Forbidden" });

      const decodedToken = decoded as DecodedRefreshToken;

      const foundToken = await fastify.redis.get(decodedToken.username);
      if (foundToken !== token) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const foundUser = await prisma.user.findFirst({
        where: {
          username: decodedToken.username,
        },
      });

      if (!foundUser) return reply.code(401).send({ message: "Unauthorized" });

      const access_token = jwt.sign(
        {
          user: {
            id: foundUser.id,
            username: foundUser.username,
            role: foundUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      const refresh_token = jwt.sign(
        {
          username: foundUser.username,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
          expiresIn: "1d",
        }
      );

      //save refresh_token to DB
      fastify.redis.set(foundUser.username, refresh_token);

      return reply.send({
        access_token,
        refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      });
    }
  );
};

//@desc Logout
//@route POST /auth/logout
//@access Public

export const logout = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {};
