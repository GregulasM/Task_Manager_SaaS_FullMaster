import { createError, getCookie, getMethod, getQuery, readBody } from "h3";
import { prisma } from "../../app/lib/prisma";
import { createHmac, timingSafeEqual } from "node:crypto";

const AUTH_COOKIE = "fm_token";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type CreateTaskBody = {
  action?: "create" | "move" | "bulk_reorder" | "delete";
  projectId?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null; // ISO
  assigneeId?: string | null;
};

type UpdateTaskBody = {
  id?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null; // ISO/null
  assigneeId?: string | null; // set null to unassign
};

type MoveTaskBody = {
  action: "move";
  projectId?: string;
  id?: string; // taskId
  toStatus?: TaskStatus;
  toIndex?: number; // 0-based
};

type BulkReorderBody = {
  action: "bulk_reorder";
  projectId?: string;
  status?: TaskStatus;
  orderedIds?: string[];
};

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

async function requireProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project)
    throw createError({ statusCode: 404, statusMessage: "Project not found" });

  if (project.ownerId === userId) return { role: "OWNER" as const };

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });

  if (!membership)
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });

  return { role: membership.role as "OWNER" | "MEMBER" };
}

function mapTask(t: any) {
  const now = Date.now();
  const due = t.dueDate ? new Date(t.dueDate).getTime() : null;
  const isOverdue = !!due && due < now && t.status !== "DONE";

  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    position: t.position,
    assignee: t.assignee
      ? { id: t.assignee.id, email: t.assignee.email, name: t.assignee.name }
      : null,
    createdBy: t.createdBy
      ? { id: t.createdBy.id, email: t.createdBy.email, name: t.createdBy.name }
      : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    isOverdue,
  };
}

async function getMaxPosition(projectId: string, status: TaskStatus) {
  const last = await prisma.task.findFirst({
    where: { projectId, status },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return last?.position ?? -1;
}

async function reindexColumn(tx: any, projectId: string, status: TaskStatus) {
  const tasks = await tx.task.findMany({
    where: { projectId, status },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  for (let i = 0; i < tasks.length; i++) {
    await tx.task.update({
      where: { id: tasks[i].id },
      data: { position: i },
    });
  }
}

async function moveTaskTransactional(
  tx: any,
  projectId: string,
  taskId: string,
  toStatus: TaskStatus,
  toIndex: number,
) {
  const task = await tx.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, status: true, position: true },
  });

  if (!task || task.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Task not found" });
  }

  const fromStatus = task.status as TaskStatus;

  const dest = await tx.task.findMany({
    where: { projectId, status: toStatus },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const filtered = dest.filter((t: any) => t.id !== taskId);
  const idx = Number.isFinite(toIndex)
    ? Math.max(0, Math.min(toIndex, filtered.length))
    : filtered.length;

  filtered.splice(idx, 0, { id: taskId });

  await tx.task.update({
    where: { id: taskId },
    data: { status: toStatus },
  });

  for (let i = 0; i < filtered.length; i++) {
    await tx.task.update({
      where: { id: filtered[i].id },
      data: { position: i },
    });
  }

  if (fromStatus !== toStatus) {
    await reindexColumn(tx, projectId, fromStatus);
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event) as Record<string, any>;

  // ==========================
  // GET
  // ==========================
  if (method === "GET") {
    const user = await requireAuth(event);

    const action = (query?.action || "board") as string;
    const projectId = (query?.projectId || query?.id || "") as string;

    if (!projectId)
      throw createError({
        statusCode: 400,
        statusMessage: "Missing projectId",
      });

    await requireProjectAccess(projectId, user.id);

    // single task
    if (action === "one") {
      const id = (query?.taskId ||
        query?.idTask ||
        query?.tid ||
        query?.task ||
        query?.id ||
        "") as string;
      if (!id)
        throw createError({ statusCode: 400, statusMessage: "Missing taskId" });

      const task = await prisma.task.findUnique({
        where: { id },
        select: {
          id: true,
          projectId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          position: true,
          assignee: { select: { id: true, email: true, name: true } },
          createdBy: { select: { id: true, email: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!task || task.projectId !== projectId)
        throw createError({ statusCode: 404, statusMessage: "Task not found" });

      return mapTask(task);
    }

    // stats
    if (action === "stats") {
      const now = new Date();

      const [byStatus, overdue] = await Promise.all([
        prisma.task.groupBy({
          by: ["status"],
          where: { projectId },
          _count: { _all: true },
        }),
        prisma.task.count({
          where: { projectId, dueDate: { lt: now }, status: { not: "DONE" } },
        }),
      ]);

      const counts: Record<TaskStatus, number> = {
        TODO: 0,
        IN_PROGRESS: 0,
        REVIEW: 0,
        DONE: 0,
      };

      for (const row of byStatus as any[]) {
        counts[row.status as TaskStatus] = row._count._all;
      }

      return { projectId, byStatus: counts, overdue };
    }

    // list (filtered)
    if (action === "list") {
      const status = (query?.status || "") as TaskStatus | "";
      const assigneeId = (query?.assigneeId || "") as string;
      const overdueOnly = query?.overdue === "1";

      const where: any = { projectId };

      if (status) where.status = status;
      if (assigneeId) where.assigneeId = assigneeId;
      if (overdueOnly) where.dueDate = { lt: new Date() };

      const tasks = await prisma.task.findMany({
        where,
        orderBy: [{ status: "asc" }, { position: "asc" }],
        select: {
          id: true,
          projectId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          position: true,
          assignee: { select: { id: true, email: true, name: true } },
          createdBy: { select: { id: true, email: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      });

      return tasks.map(mapTask);
    }

    // board (default)
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: "asc" }, { position: "asc" }],
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        position: true,
        assignee: { select: { id: true, email: true, name: true } },
        createdBy: { select: { id: true, email: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    const columns: Record<TaskStatus, any[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    for (const t of tasks as any[])
      columns[t.status as TaskStatus].push(mapTask(t));

    const now = new Date();
    const [overdue, byStatusRaw] = await Promise.all([
      prisma.task.count({
        where: { projectId, dueDate: { lt: now }, status: { not: "DONE" } },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId },
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };

    for (const row of byStatusRaw as any[]) {
      byStatus[row.status as TaskStatus] = row._count._all;
    }

    return { projectId, columns, stats: { byStatus, overdue } };
  }

  // ==========================
  // POST
  // ==========================
  if (method === "POST") {
    const user = await requireAuth(event);
    const body = await readBody<
      CreateTaskBody | MoveTaskBody | BulkReorderBody
    >(event);
    const action = (body as any)?.action ?? "create";

    // create
    if (action === "create") {
      const b = body as CreateTaskBody;

      const projectId = (b?.projectId || "").trim();
      const title = b?.title?.trim();
      const description = b?.description?.trim();
      const status = (b?.status || "TODO") as TaskStatus;
      const priority = (b?.priority || "MEDIUM") as TaskPriority;
      const assigneeId =
        typeof b?.assigneeId === "string" ? b.assigneeId.trim() : null;

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!title)
        throw createError({ statusCode: 400, statusMessage: "Missing title" });

      await requireProjectAccess(projectId, user.id);

      if (assigneeId) {
        const member = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId, userId: assigneeId } },
          select: { userId: true },
        });
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { ownerId: true },
        });
        const isOwner = project?.ownerId === assigneeId;
        if (!member && !isOwner) {
          throw createError({
            statusCode: 400,
            statusMessage: "Assignee is not in project",
          });
        }
      }

      const dueDate =
        typeof b?.dueDate === "string" && b.dueDate
          ? new Date(b.dueDate)
          : b?.dueDate === null
            ? null
            : null;

      const position = (await getMaxPosition(projectId, status)) + 1;

      const created = await prisma.task.create({
        data: {
          projectId,
          title,
          description: description || null,
          status,
          priority,
          dueDate,
          position,
          assigneeId: assigneeId || null,
          createdById: user.id,
        },
        select: {
          id: true,
          projectId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          position: true,
          assignee: { select: { id: true, email: true, name: true } },
          createdBy: { select: { id: true, email: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      });

      return mapTask(created);
    }

    // move (drag & drop)
    if (action === "move") {
      const b = body as MoveTaskBody;

      const projectId = (b?.projectId || "").trim();
      const id = (b?.id || "").trim();
      const toStatus = (b?.toStatus || "").trim() as TaskStatus;
      const toIndex = typeof b?.toIndex === "number" ? b.toIndex : 0;

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!id)
        throw createError({ statusCode: 400, statusMessage: "Missing id" });
      if (!toStatus)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing toStatus",
        });

      await requireProjectAccess(projectId, user.id);

      const updated = await prisma.$transaction(async (tx) => {
        await moveTaskTransactional(tx, projectId, id, toStatus, toIndex);

        const task = await tx.task.findUnique({
          where: { id },
          select: {
            id: true,
            projectId: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            position: true,
            assignee: { select: { id: true, email: true, name: true } },
            createdBy: { select: { id: true, email: true, name: true } },
            createdAt: true,
            updatedAt: true,
          },
        });

        return task;
      });

      if (!updated)
        throw createError({ statusCode: 404, statusMessage: "Task not found" });

      return mapTask(updated);
    }

    // bulk reorder (single column)
    if (action === "bulk_reorder") {
      const b = body as BulkReorderBody;

      const projectId = (b?.projectId || "").trim();
      const status = (b?.status || "").trim() as TaskStatus;
      const orderedIds = Array.isArray(b?.orderedIds) ? b!.orderedIds! : [];

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!status)
        throw createError({ statusCode: 400, statusMessage: "Missing status" });
      if (!orderedIds.length)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing orderedIds",
        });

      await requireProjectAccess(projectId, user.id);

      await prisma.$transaction(async (tx) => {
        const tasks = await tx.task.findMany({
          where: { projectId, status },
          select: { id: true },
        });

        const set = new Set(tasks.map((t: any) => t.id));
        for (const id of orderedIds) {
          if (!set.has(id)) {
            throw createError({
              statusCode: 400,
              statusMessage: "orderedIds contains invalid task id",
            });
          }
        }

        for (let i = 0; i < orderedIds.length; i++) {
          await tx.task.update({
            where: { id: orderedIds[i] },
            data: { position: i },
          });
        }
      });

      return { ok: true };
    }

    // delete (POST variant)
    if (action === "delete") {
      const b = body as any;
      const projectId = (b?.projectId || "").trim();
      const id = (b?.id || "").trim();

      if (!projectId)
        throw createError({
          statusCode: 400,
          statusMessage: "Missing projectId",
        });
      if (!id)
        throw createError({ statusCode: 400, statusMessage: "Missing id" });

      await requireProjectAccess(projectId, user.id);

      const task = await prisma.task.findUnique({
        where: { id },
        select: { id: true, projectId: true, status: true },
      });

      if (!task || task.projectId !== projectId)
        throw createError({ statusCode: 404, statusMessage: "Task not found" });

      await prisma.$transaction(async (tx) => {
        const status = task.status as TaskStatus;
        await tx.task.delete({ where: { id } });
        await reindexColumn(tx, projectId, status);
      });

      return { ok: true };
    }

    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  }

  // ==========================
  // PATCH (update card)
  // ==========================
  if (method === "PATCH") {
    const user = await requireAuth(event);
    const body = await readBody<UpdateTaskBody>(event);

    const id = (body?.id || "").trim();
    if (!id)
      throw createError({ statusCode: 400, statusMessage: "Missing id" });

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, status: true },
    });

    if (!existing)
      throw createError({ statusCode: 404, statusMessage: "Task not found" });

    await requireProjectAccess(existing.projectId, user.id);

    const title =
      typeof body?.title === "string" ? body.title.trim() : undefined;
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : body?.description === null
          ? null
          : undefined;

    const dueDate =
      typeof body?.dueDate === "string" && body.dueDate
        ? new Date(body.dueDate)
        : body?.dueDate === null
          ? null
          : undefined;

    const assigneeId =
      typeof body?.assigneeId === "string"
        ? body.assigneeId.trim() || null
        : body?.assigneeId === null
          ? null
          : undefined;

    if (typeof assigneeId === "string" && assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: existing.projectId,
            userId: assigneeId,
          },
        },
        select: { userId: true },
      });
      const project = await prisma.project.findUnique({
        where: { id: existing.projectId },
        select: { ownerId: true },
      });
      const isOwner = project?.ownerId === assigneeId;
      if (!member && !isOwner) {
        throw createError({
          statusCode: 400,
          statusMessage: "Assignee is not in project",
        });
      }
    }

    const status = body?.status;
    const priority = body?.priority;

    const updated = await prisma.$transaction(async (tx) => {
      // status change: move to end of new column
      if (status && status !== (existing.status as TaskStatus)) {
        const newPos = (await getMaxPosition(existing.projectId, status)) + 1;

        await tx.task.update({
          where: { id },
          data: {
            ...(typeof title !== "undefined" ? { title } : {}),
            ...(typeof description !== "undefined" ? { description } : {}),
            ...(typeof dueDate !== "undefined" ? { dueDate } : {}),
            ...(typeof assigneeId !== "undefined" ? { assigneeId } : {}),
            ...(typeof priority !== "undefined" ? { priority } : {}),
            status,
            position: newPos,
          },
        });

        await reindexColumn(
          tx,
          existing.projectId,
          existing.status as TaskStatus,
        );
      } else {
        await tx.task.update({
          where: { id },
          data: {
            ...(typeof title !== "undefined" ? { title } : {}),
            ...(typeof description !== "undefined" ? { description } : {}),
            ...(typeof dueDate !== "undefined" ? { dueDate } : {}),
            ...(typeof assigneeId !== "undefined" ? { assigneeId } : {}),
            ...(typeof priority !== "undefined" ? { priority } : {}),
          },
        });
      }

      return await tx.task.findUnique({
        where: { id },
        select: {
          id: true,
          projectId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          position: true,
          assignee: { select: { id: true, email: true, name: true } },
          createdBy: { select: { id: true, email: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    if (!updated)
      throw createError({ statusCode: 404, statusMessage: "Task not found" });

    return mapTask(updated);
  }

  // ==========================
  // DELETE
  // ==========================
  if (method === "DELETE") {
    const user = await requireAuth(event);

    const projectId = ((query?.projectId || "") as string).trim();
    const id = ((query?.id || "") as string).trim();

    if (!projectId)
      throw createError({
        statusCode: 400,
        statusMessage: "Missing projectId",
      });
    if (!id)
      throw createError({ statusCode: 400, statusMessage: "Missing id" });

    await requireProjectAccess(projectId, user.id);

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, status: true },
    });

    if (!task || task.projectId !== projectId)
      throw createError({ statusCode: 404, statusMessage: "Task not found" });

    await prisma.$transaction(async (tx) => {
      const status = task.status as TaskStatus;
      await tx.task.delete({ where: { id } });
      await reindexColumn(tx, projectId, status);
    });

    return { ok: true };
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});
