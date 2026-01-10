import {
  createError,
  getCookie,
  getMethod,
  getQuery,
  readBody,
  setCookie,
  deleteCookie,
} from "h3";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { prisma } from "../../app/lib/prisma";

type CreateUserBody = {
  email?: string;
  password?: string;
  name?: string;

  // api control
  action?: "register" | "login" | "logout";
  __test?: boolean; // legacy test hook (keeps your working snippet intact)
};

type UpdateUserBody = {
  name?: string;
  password?: string;
};

const AUTH_COOKIE = "fm_token";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7d

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  // lightweight validation (MVP)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pickUserPublic(user: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    ...(user.updatedAt ? { updatedAt: user.updatedAt } : {}),
  };
}

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlToBuffer(input: string) {
  const pad = input.length % 4 ? "=".repeat(4 - (input.length % 4)) : "";
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function getAuthSecret(event: any) {
  const config = useRuntimeConfig(event) as any;
  const secret =
    config?.authSecret ||
    config?.sessionSecret ||
    config?.jwtSecret ||
    config?.nitro?.authSecret;
  if (!secret || typeof secret !== "string") {
    throw createError({
      statusCode: 500,
      statusMessage: "Server auth secret is not configured",
    });
  }
  return secret;
}

function signToken(
  payload: Record<string, any>,
  secret: string,
  ttlSec: number,
) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSec };

  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(fullPayload));

  const toSign = `${headerPart}.${payloadPart}`;
  const sig = createHmac("sha256", secret).update(toSign).digest();
  const sigPart = base64url(sig);

  return `${toSign}.${sigPart}`;
}

function verifyToken(
  token: string,
  secret: string,
): null | Record<string, any> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, sigPart] = parts;

    const toSign = `${headerPart}.${payloadPart}`;
    const expected = createHmac("sha256", secret).update(toSign).digest();
    const actual = base64urlToBuffer(sigPart);

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;

    const payloadJson = base64urlToBuffer(payloadPart).toString("utf8");
    const payload = JSON.parse(payloadJson) as Record<string, any>;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${base64url(salt)}$${base64url(hash)}`;
}

function verifyPassword(password: string, stored: string) {
  // legacy plaintext support for test-created users
  if (!stored.startsWith("scrypt$")) return password === stored;

  const parts = stored.split("$");
  if (parts.length !== 3 && parts.length !== 4) return false;

  const saltPart = parts.length === 3 ? parts[1] : parts[2];
  const hashPart = parts.length === 3 ? parts[2] : parts[3];
  const salt = base64urlToBuffer(saltPart);
  const expected = base64urlToBuffer(hashPart);

  const actual = scryptSync(password, salt, 64);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

async function requireAuth(event: any) {
  const token = getCookie(event, AUTH_COOKIE);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const secret = getAuthSecret(event);
  const payload = verifyToken(token, secret);

  if (!payload?.sub || typeof payload.sub !== "string") {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return user;
}

// ==========================
// LEGACY TEST CODE (kept)
// ==========================
async function legacyTestCreateUser(event: any) {
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
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event) as Record<string, any>;

  // LEGACY TEST ENTRYPOINT (keeps your working snippet usable)
  if (method === "POST") {
    const body = await readBody<CreateUserBody>(event);
    if (body?.__test === true) return await legacyTestCreateUser(event);

    const action = body?.action ?? "register";

    // ==========================
    // REGISTER
    // ==========================
    if (action === "register") {
      const emailRaw = body?.email;
      const nameRaw = body?.name;
      const password = body?.password;

      const email = emailRaw ? normalizeEmail(emailRaw) : "";
      const name = nameRaw?.trim() ?? "";

      if (!email || !name || !password) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing required fields",
        });
      }

      if (!isValidEmail(email)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid email" });
      }

      if (password.length < 8) {
        throw createError({
          statusCode: 400,
          statusMessage: "Password must be at least 8 characters",
        });
      }

      try {
        const created = await prisma.user.create({
          data: {
            email,
            name,
            passwordHash: hashPassword(password),
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return pickUserPublic(created);
      } catch (err: any) {
        if (err?.code === "P2002") {
          throw createError({
            statusCode: 409,
            statusMessage: "Email already exists",
          });
        }
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to create user",
        });
      }
    }

    // ==========================
    // LOGIN
    // ==========================
    if (action === "login") {
      const emailRaw = body?.email;
      const password = body?.password;

      const email = emailRaw ? normalizeEmail(emailRaw) : "";

      if (!email || !password) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing required fields",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user || !verifyPassword(password, user.passwordHash)) {
        throw createError({
          statusCode: 401,
          statusMessage: "Invalid credentials",
        });
      }

      const secret = getAuthSecret(event);
      const token = signToken(
        { sub: user.id, email: user.email, name: user.name },
        secret,
        TOKEN_TTL_SEC,
      );

      setCookie(event, AUTH_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: TOKEN_TTL_SEC,
      });

      return { user: pickUserPublic(user) };
    }

    // ==========================
    // LOGOUT
    // ==========================
    if (action === "logout") {
      deleteCookie(event, AUTH_COOKIE, { path: "/" });
      return { ok: true };
    }

    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  }

  // ==========================
  // GET: me | user by id
  // ==========================
  if (method === "GET") {
    if (query?.me === "1" || query?.action === "me") {
      const user = await requireAuth(event);
      return pickUserPublic(user);
    }

    const id = typeof query?.id === "string" ? query.id : "";
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Missing id" });
    }

    await requireAuth(event); // protected

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return pickUserPublic(user);
  }

  // ==========================
  // PATCH: update self (name/password)
  // ==========================
  if (method === "PATCH") {
    const me = await requireAuth(event);
    const body = await readBody<UpdateUserBody>(event);

    const name = body?.name?.trim();
    const password = body?.password;

    if (!name && !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nothing to update",
      });
    }

    const data: any = {};
    if (name) data.name = name;

    if (password) {
      if (password.length < 8) {
        throw createError({
          statusCode: 400,
          statusMessage: "Password must be at least 8 characters",
        });
      }
      data.passwordHash = hashPassword(password);
    }

    try {
      const updated = await prisma.user.update({
        where: { id: me.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return pickUserPublic(updated);
    } catch (err: any) {
      if (err?.code === "P2025") {
        throw createError({ statusCode: 404, statusMessage: "User not found" });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update user",
      });
    }
  }

  // ==========================
  // DELETE: delete self
  // ==========================
  if (method === "DELETE") {
    const me = await requireAuth(event);

    try {
      await prisma.user.delete({ where: { id: me.id } });
      deleteCookie(event, AUTH_COOKIE, { path: "/" });
      return { ok: true };
    } catch (err: any) {
      if (err?.code === "P2025") {
        throw createError({ statusCode: 404, statusMessage: "User not found" });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete user",
      });
    }
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});
