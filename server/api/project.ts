import { createError, getCookie, getMethod, getQuery, readBody } from "h3";
import { prisma } from "../../app/lib/prisma";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const AUTH_COOKIE = "fm_token";

type ProjectPostBody = {
  action?:
    | "create"
    | "request_access"
    | "invite"
    | "accept_invite"
    | "decline_invite"
    | "approve_request"
    | "reject_request"
    | "revoke_invite"
    | "remove_member";
  id?: string; // projectId (alias)
  projectId?: string;

  name?: string;
  description?: string;

  email?: string; // invitee email
  token?: string; // invitation token
  invitationId?: string;

  memberUserId?: string; // for owner removing member
};

type ProjectPatchBody = {
  id?: string;
  name?: string;
  description?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

async function requireAuth(event: any) {
  const token = getCookie(event, AUTH_COOKIE);
  if (!token)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const secret = getAuthSecret(event);
  const payload = verifyToken(token, secret);

  if (!payload?.sub || typeof payload.sub !== "string") {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true },
  });

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  return user;
}

function randomToken(bytes = 24) {
  return base64url(randomBytes(bytes));
}

async function getInvitationForUserAction({
  token,
  invitationId,
  email,
}: {
  token?: string;
  invitationId?: string;
  email: string;
}) {
  if (!token && !invitationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing token or invitationId",
    });
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: token ? { token } : { id: invitationId! },
    select: {
      id: true,
      projectId: true,
      email: true,
      status: true,
      token: true,
    },
  });

  if (!invitation)
    throw createError({
      statusCode: 404,
      statusMessage: "Invitation not found",
    });

  if (invitation.status !== "PENDING") {
    throw createError({
      statusCode: 409,
      statusMessage: "Invitation not pending",
    });
  }

  if (normalizeEmail(invitation.email) !== normalizeEmail(email)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  return invitation;
}

async function getRequestForOwnerAction({
  invitationId,
  ownerId,
}: {
  invitationId?: string;
  ownerId: string;
}) {
  if (!invitationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing invitationId",
    });
  }

  const invitation = await prisma.projectInvitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      projectId: true,
      status: true,
      invitedById: true,
      project: { select: { ownerId: true } },
    },
  });

  if (!invitation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invitation not found",
    });
  }

  if (invitation.status !== "PENDING") {
    throw createError({
      statusCode: 409,
      statusMessage: "Invitation not pending",
    });
  }

  if (invitation.project.ownerId !== ownerId) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  if (!invitation.invitedById || invitation.invitedById === ownerId) {
    throw createError({ statusCode: 409, statusMessage: "Not a request" });
  }

  return invitation;
}

async function attachTaskCounts(projects: Array<{ id: string }>) {
  const ids = projects.map((p) => p.id);
  if (!ids.length)
    return {
      totals: new Map<string, number>(),
      hots: new Map<string, number>(),
    };

  const totalsRaw = await prisma.task.groupBy({
    by: ["projectId"],
    _count: { _all: true },
    where: { projectId: { in: ids } },
  });

  const now = new Date();
  const hotsRaw = await prisma.task.groupBy({
    by: ["projectId"],
    _count: { _all: true },
    where: {
      projectId: { in: ids },
      dueDate: { lt: now },
      status: { not: "DONE" },
    },
  });

  const totals = new Map<string, number>();
  for (const row of totalsRaw) totals.set(row.projectId, row._count._all);

  const hots = new Map<string, number>();
  for (const row of hotsRaw) hots.set(row.projectId, row._count._all);

  return { totals, hots };
}

function roleForProject(
  userId: string,
  project: { ownerId: string; members?: Array<{ role: any }> },
) {
  if (project.ownerId === userId) return "OWNER";
  const m = project.members?.[0];
  return m?.role ?? null;
}

async function getProjectForAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: { select: { id: true, email: true, name: true } },
      members: { where: { userId }, select: { role: true } },
    },
  });

  if (!project)
    throw createError({ statusCode: 404, statusMessage: "Project not found" });

  const role = roleForProject(userId, project);
  if (!role) throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  return { project, role };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event) as Record<string, any>;

  // ==========================
  // GET
  // ==========================
  if (method === "GET") {
    const user = await requireAuth(event);

    const scope = (query?.scope || query?.action || "") as string;

    // my projects: owned + member
    if (scope === "my") {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, name: true, email: true } },
          members: { where: { userId: user.id }, select: { role: true } },
        },
      });

      const { totals, hots } = await attachTaskCounts(projects);

      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        ownerId: p.ownerId,
        owner: p.owner,
        role: roleForProject(user.id, p),
        tasksCount: totals.get(p.id) ?? 0,
        hotTasksCount: hots.get(p.id) ?? 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    }

    // other projects: not owned + not member
    if (scope === "other") {
      const projects = await prisma.project.findMany({
        where: {
          AND: [
            { ownerId: { not: user.id } },
            { members: { none: { userId: user.id } } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      });

      const { totals, hots } = await attachTaskCounts(projects);

      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        ownerId: p.ownerId,
        owner: p.owner,
        tasksCount: totals.get(p.id) ?? 0,
        hotTasksCount: hots.get(p.id) ?? 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    }

    // invitations list (owner only)
    if (scope === "invitations") {
      const projectId = (query?.projectId || query?.id || "") as string;
      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });

      const { project } = await getProjectForAccess(projectId, user.id);
      if (project.ownerId !== user.id)
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });

      const invitations = await prisma.projectInvitation.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          status: true,
          token: true,
          createdAt: true,
          respondedAt: true,
          invitedBy: { select: { id: true, email: true, name: true } },
          acceptedBy: { select: { id: true, email: true, name: true } },
        },
      });

      return invitations;
    }

    // invitations for current user + access requests to owned projects
    if (scope === "invites" || scope === "my_invites") {
      const email = normalizeEmail(user.email);

      const [invitations, requests] = await Promise.all([
        prisma.projectInvitation.findMany({
          where: {
            email,
            status: "PENDING",
            invitedById: { not: user.id },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            token: true,
            email: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
              },
            },
            invitedBy: { select: { id: true, email: true, name: true } },
          },
        }),
        prisma.projectInvitation.findMany({
          where: {
            status: "PENDING",
            invitedById: { not: user.id },
            project: { ownerId: user.id },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
              },
            },
            invitedBy: { select: { id: true, email: true, name: true } },
          },
        }),
      ]);

      const items = [
        ...invitations.map((invite) => ({
          id: invite.id,
          kind: "invite" as const,
          projectId: invite.project.id,
          projectName: invite.project.name,
          projectDescription: invite.project.description,
          invitedBy: invite.invitedBy,
          createdAt: invite.createdAt,
        })),
        ...requests.map((request) => ({
          id: request.id,
          kind: "request" as const,
          projectId: request.project.id,
          projectName: request.project.name,
          projectDescription: request.project.description,
          invitedBy: request.invitedBy,
          createdAt: request.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return items;
    }

    // project details (member/owner)
    const id = (query?.id || "") as string;
    if (!id)
      throw createError({ statusCode: 400, statusMessage: "Missing id" });

    const { project, role } = await getProjectForAccess(id, user.id);

    const [tasksCount, hotTasksCount, members, invitations] = await Promise.all(
      [
        prisma.task.count({ where: { projectId: id } }),
        prisma.task.count({
          where: {
            projectId: id,
            dueDate: { lt: new Date() },
            status: { not: "DONE" },
          },
        }),
        prisma.projectMember.findMany({
          where: { projectId: id },
          orderBy: { joinedAt: "asc" },
          select: {
            role: true,
            joinedAt: true,
            user: { select: { id: true, email: true, name: true } },
          },
        }),
        role === "OWNER"
          ? prisma.projectInvitation.findMany({
              where: { projectId: id, status: "PENDING" },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                email: true,
                status: true,
                token: true,
                createdAt: true,
              },
            })
          : Promise.resolve([]),
      ],
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        owner: project.owner,
        role,
        tasksCount,
        hotTasksCount,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      members,
      invitations,
    };
  }

  // ==========================
  // POST
  // ==========================
  if (method === "POST") {
    const user = await requireAuth(event);
    const body = await readBody<ProjectPostBody>(event);
    const action = body?.action ?? "create";

    // create project
    if (action === "create") {
      const name = body?.name?.trim();
      const description = body?.description?.trim();

      if (!name)
        throw createError({ statusCode: 400, statusMessage: "Missing name" });

      const created = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: { name, description: description || null, ownerId: user.id },
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            owner: { select: { id: true, email: true, name: true } },
          },
        });

        await tx.projectMember.create({
          data: { projectId: project.id, userId: user.id, role: "OWNER" },
        });

        return project;
      });

      return {
        ...created,
        role: "OWNER",
        tasksCount: 0,
        hotTasksCount: 0,
      };
    }

    // request access (creates a pending request)
    if (action === "request_access") {
      const projectId = (body?.projectId || body?.id || "").trim();

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, ownerId: true },
      });

      if (!project)
        throw createError({
          statusCode: 404,
          statusMessage: "Project not found",
        });

      if (project.ownerId === user.id) {
        return { ok: true, role: "OWNER" };
      }

      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: user.id },
        },
        select: { role: true },
      });

      if (existingMember?.role) {
        return { ok: true, role: existingMember.role };
      }

      const email = normalizeEmail(user.email);
      const existingInvitation = await prisma.projectInvitation.findUnique({
        where: { projectId_email: { projectId, email } },
        select: { id: true, status: true, invitedById: true },
      });

      if (existingInvitation) {
        if (
          existingInvitation.status === "PENDING" &&
          existingInvitation.invitedById !== user.id
        ) {
          return { ok: true, status: "ALREADY_INVITED" };
        }

        await prisma.projectInvitation.update({
          where: { id: existingInvitation.id },
          data: {
            token: randomToken(),
            status: "PENDING",
            invitedById: user.id,
            acceptedById: null,
            respondedAt: null,
          },
        });

        return { ok: true, status: "PENDING" };
      }

      await prisma.projectInvitation.create({
        data: {
          projectId,
          email,
          token: randomToken(),
          invitedById: user.id,
          status: "PENDING",
          acceptedById: null,
          respondedAt: null,
        },
        select: { id: true },
      });

      return { ok: true, status: "PENDING" };
    }

    // invite user by email (owner only)
    if (action === "invite") {
      const projectId = (body?.projectId || body?.id || "").trim();
      const emailRaw = body?.email;

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!emailRaw)
        throw createError({ statusCode: 400, statusMessage: "Missing email" });

      const email = normalizeEmail(emailRaw);
      if (!isValidEmail(email))
        throw createError({ statusCode: 400, statusMessage: "Invalid email" });

      const { project } = await getProjectForAccess(projectId, user.id);
      if (project.ownerId !== user.id)
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });

      if (email === normalizeEmail(user.email)) {
        throw createError({
          statusCode: 409,
          statusMessage: "Already a member",
        });
      }

      const invitee = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (invitee) {
        if (invitee.id === project.ownerId) {
          throw createError({
            statusCode: 409,
            statusMessage: "Already a member",
          });
        }

        const existingMember = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: { projectId, userId: invitee.id },
          },
          select: { userId: true },
        });

        if (existingMember?.userId) {
          throw createError({
            statusCode: 409,
            statusMessage: "Already a member",
          });
        }
      }

      const token = randomToken();

      try {
        const invitation = await prisma.projectInvitation.create({
          data: {
            projectId,
            email,
            token,
            invitedById: user.id,
            status: "PENDING",
            acceptedById: null,
            respondedAt: null,
          },
          select: {
            id: true,
            email: true,
            status: true,
            token: true,
            createdAt: true,
          },
        });

        return invitation;
      } catch (err: any) {
        // unique (projectId, email) already exists -> re-issue invite
        if (err?.code === "P2002") {
          const updated = await prisma.projectInvitation.update({
            where: { projectId_email: { projectId, email } },
            data: {
              token,
              status: "PENDING",
              invitedById: user.id,
              acceptedById: null,
              respondedAt: null,
            },
            select: {
              id: true,
              email: true,
              status: true,
              token: true,
              createdAt: true,
            },
          });
          return updated;
        }
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to invite",
        });
      }
    }

    // accept invitation (invited user)
    if (action === "accept_invite") {
      const token = body?.token?.trim();
      const invitationId = body?.invitationId?.trim();

      const invitation = await getInvitationForUserAction({
        token,
        invitationId,
        email: user.email,
      });

      const result = await prisma.$transaction(async (tx) => {
        await tx.projectInvitation.update({
          where: { id: invitation.id },
          data: {
            status: "ACCEPTED",
            acceptedById: user.id,
            respondedAt: new Date(),
          },
        });

        await tx.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: invitation.projectId,
              userId: user.id,
            },
          },
          update: {},
          create: {
            projectId: invitation.projectId,
            userId: user.id,
            role: "MEMBER",
          },
        });

        const project = await tx.project.findUnique({
          where: { id: invitation.projectId },
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return project;
      });

      if (!result)
        throw createError({
          statusCode: 404,
          statusMessage: "Project not found",
        });

      return { ok: true, project: result };
    }

    // decline invitation (invited user)
    if (action === "decline_invite") {
      const token = body?.token?.trim();
      const invitationId = body?.invitationId?.trim();

      const invitation = await getInvitationForUserAction({
        token,
        invitationId,
        email: user.email,
      });

      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "DECLINED",
          acceptedById: null,
          respondedAt: new Date(),
        },
      });

      return { ok: true };
    }

    // approve access request (owner)
    if (action === "approve_request") {
      const invitationId = body?.invitationId?.trim();

      const invitation = await getRequestForOwnerAction({
        invitationId,
        ownerId: user.id,
      });

      await prisma.$transaction(async (tx) => {
        await tx.projectInvitation.update({
          where: { id: invitation.id },
          data: {
            status: "ACCEPTED",
            acceptedById: invitation.invitedById,
            respondedAt: new Date(),
          },
        });

        await tx.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: invitation.projectId,
              userId: invitation.invitedById!,
            },
          },
          update: {},
          create: {
            projectId: invitation.projectId,
            userId: invitation.invitedById!,
            role: "MEMBER",
          },
        });
      });

      return { ok: true };
    }

    // reject access request (owner)
    if (action === "reject_request") {
      const invitationId = body?.invitationId?.trim();

      const invitation = await getRequestForOwnerAction({
        invitationId,
        ownerId: user.id,
      });

      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "DECLINED",
          acceptedById: null,
          respondedAt: new Date(),
        },
      });

      return { ok: true };
    }

    // revoke invitation (owner only)
    if (action === "revoke_invite") {
      const projectId = (body?.projectId || body?.id || "").trim();
      const invitationId = (body?.invitationId || "").trim();

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!invitationId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing invitationId",
        });

      const { project } = await getProjectForAccess(projectId, user.id);
      if (project.ownerId !== user.id)
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });

      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: "REVOKED", respondedAt: new Date() },
      });

      return { ok: true };
    }

    // remove member (owner only)
    if (action === "remove_member") {
      const projectId = (body?.projectId || body?.id || "").trim();
      const memberUserId = (body?.memberUserId || "").trim();

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!memberUserId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing memberUserId",
        });

      const { project } = await getProjectForAccess(projectId, user.id);
      if (project.ownerId !== user.id)
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });

      if (memberUserId === project.ownerId) {
        throw createError({
          statusCode: 409,
          statusMessage: "Cannot remove owner",
        });
      }

      await prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId: memberUserId } },
      });

      return { ok: true };
    }

    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  }

  // ==========================
  // PATCH (update project - owner only)
  // ==========================
  if (method === "PATCH") {
    const user = await requireAuth(event);
    const body = await readBody<ProjectPatchBody>(event);

    const projectId = (body?.id || (query?.id as string) || "").trim();
    if (!projectId)
      throw createError({ statusCode: 400, statusMessage: "Missing id" });

    const name = body?.name?.trim();
    const description = body?.description?.trim();

    if (!name && typeof description === "undefined") {
      throw createError({
        statusCode: 400,
        statusMessage: "Nothing to update",
      });
    }

    const { project } = await getProjectForAccess(projectId, user.id);
    if (project.ownerId !== user.id)
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name ? { name } : {}),
        ...(typeof description !== "undefined"
          ? { description: description || null }
          : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  // ==========================
  // DELETE (delete project owner / leave project member)
  // ==========================
  if (method === "DELETE") {
    const user = await requireAuth(event);

    const projectId = ((query?.id as string) || "").trim();
    if (!projectId)
      throw createError({ statusCode: 400, statusMessage: "Missing id" });

    const leave = query?.leave === "1" || query?.action === "leave";

    const { project, role } = await getProjectForAccess(projectId, user.id);

    // leave from "My"
    if (leave) {
      if (role === "OWNER")
        throw createError({
          statusCode: 409,
          statusMessage: "Owner cannot leave",
        });

      await prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId: user.id } },
      });

      return { ok: true };
    }

    // delete project
    if (project.ownerId !== user.id)
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });

    await prisma.project.delete({ where: { id: projectId } });
    return { ok: true };
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});
