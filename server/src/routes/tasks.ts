import { Router } from "express";
import { db, type Task } from "../db.js";

export const tasksRouter = Router();

function mapTaskSelect() {
  return `
    SELECT
      tasks.id,
      tasks.title,
      tasks.status,
      tasks.assignee_id,
      users.name AS assignee_name,
      tasks.created_at
    FROM tasks
    LEFT JOIN users ON users.id = tasks.assignee_id
  `;
}

function parseAssigneeId(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

// GET /api/tasks?status=open&search=foo&assigneeId=1&assigneeId=unassigned
tasksRouter.get("/", (req, res) => {
  const { status, search, assigneeId } = req.query;

  let sql = `${mapTaskSelect()} WHERE 1 = 1`;
  const params: unknown[] = [];

  if (typeof status === "string" && status) {
    sql += " AND tasks.status = ?";
    params.push(status);
  }

  if (typeof search === "string" && search) {
    sql += " AND lower(tasks.title) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (assigneeId === "unassigned") {
    sql += " AND tasks.assignee_id IS NULL";
  } else if (typeof assigneeId === "string" && assigneeId) {
    const parsedAssigneeId = parseAssigneeId(assigneeId);
    if (parsedAssigneeId === undefined) {
      return res.status(400).json({ error: "assigneeId must be a positive integer or 'unassigned'" });
    }

    sql += " AND tasks.assignee_id = ?";
    params.push(parsedAssigneeId);
  }

  sql += " ORDER BY tasks.created_at DESC, tasks.id DESC";

  const rows = db.prepare(sql).all(...params) as Task[];
  res.json(rows);
});

// POST /api/tasks  { title, assigneeId? }
tasksRouter.post("/", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  const hasAssignee = Object.prototype.hasOwnProperty.call(req.body ?? {}, "assigneeId");
  const assigneeId = hasAssignee ? parseAssigneeId(req.body?.assigneeId) : null;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  if (assigneeId === undefined) {
    return res.status(400).json({ error: "assigneeId must be a positive integer or null" });
  }

  if (assigneeId !== null) {
    const assigneeExists = db
      .prepare("SELECT 1 FROM users WHERE id = ?")
      .get(assigneeId);

    if (!assigneeExists) {
      return res.status(400).json({ error: "assignee not found" });
    }
  }

  const result = db
    .prepare("INSERT INTO tasks (title, status, assignee_id) VALUES (?, 'open', ?)")
    .run(title, assigneeId);

  const created = db
    .prepare(`${mapTaskSelect()} WHERE tasks.id = ?`)
    .get(result.lastInsertRowid) as Task;

  res.status(201).json(created);
});

// PATCH /api/tasks/:id  { status?, assigneeId? }
tasksRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  const hasStatus = Object.prototype.hasOwnProperty.call(req.body ?? {}, "status");
  const hasAssignee = Object.prototype.hasOwnProperty.call(req.body ?? {}, "assigneeId");
  const assigneeId = parseAssigneeId(req.body?.assigneeId);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "invalid task id" });
  }

  if (!hasStatus && !hasAssignee) {
    return res.status(400).json({ error: "nothing to update" });
  }

  if (hasStatus && status !== "open" && status !== "done") {
    return res.status(400).json({ error: "status must be 'open' or 'done'" });
  }

  if (hasAssignee && assigneeId === undefined) {
    return res.status(400).json({ error: "assigneeId must be a positive integer or null" });
  }

  if (hasAssignee && assigneeId !== null) {
    const assigneeExists = db
      .prepare("SELECT 1 FROM users WHERE id = ?")
      .get(assigneeId);

    if (!assigneeExists) {
      return res.status(400).json({ error: "assignee not found" });
    }
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (hasStatus) {
    updates.push("status = ?");
    params.push(status);
  }

  if (hasAssignee) {
    updates.push("assignee_id = ?");
    params.push(assigneeId);
  }

  params.push(id);

  const result = db
    .prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`)
    .run(...params);

  if (result.changes === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  const updated = db
    .prepare(`${mapTaskSelect()} WHERE tasks.id = ?`)
    .get(id) as Task;

  res.json(updated);
});
