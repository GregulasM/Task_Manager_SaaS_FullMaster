import { createError, getMethod, readBody } from "h3";

import { prisma } from "../../app/lib/prisma";

type CreateUserBody = {
  email?: string;
  password?: string;
  name?: string;
};

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "POST") {
    throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
  }

  const body = await readBody<CreateUserBody>(event);
  const email = body?.email?.trim();
  const name = body?.name?.trim();
  const password = body?.password;

  if (!email || !name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: password,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  console.log("Test user created:", user);

  return user;
});
