import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchTasks,
  fetchUsers,
  setTaskAssignee,
  setTaskStatus,
  type Task,
  type User,
} from "./api.js";
import { TaskList } from "./components/TaskList.js";
import { NewTaskForm } from "./components/NewTaskForm.js";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [updatingTaskIds, setUpdatingTaskIds] = useState<number[]>([]);
  const loadRequestId = useRef(0);

  const load = useCallback(() => {
    const requestId = ++loadRequestId.current;

    fetchTasks({ status, search, assigneeId }).then((nextTasks) => {
      if (requestId === loadRequestId.current) {
        setTasks(nextTasks);
      }
    });
  }, [assigneeId, search, status]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(task: Task) {
    setUpdatingTaskIds((current) => [...current, task.id]);
    try {
      await setTaskStatus(task.id, task.status === "done" ? "open" : "done");
      load();
    } finally {
      setUpdatingTaskIds((current) => current.filter((value) => value !== task.id));
    }
  }

  async function handleAssigneeChange(task: Task, nextAssigneeId: number | null) {
    setUpdatingTaskIds((current) => [...current, task.id]);
    try {
      await setTaskAssignee(task.id, nextAssigneeId);
      load();
    } finally {
      setUpdatingTaskIds((current) => current.filter((value) => value !== task.id));
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3efe8",
        padding: "32px 16px 48px",
        color: "#182126",
        fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255, 251, 247, 0.78)",
            border: "1px solid rgba(24, 33, 38, 0.12)",
            boxShadow: "0 18px 40px rgba(32, 40, 48, 0.12)",
            backdropFilter: "blur(10px)",
            padding: 28,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#6f6257",
                marginBottom: 8,
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Team planning
            </div>
            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1, fontWeight: 600 }}>
              TeamTasks
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 540,
                color: "#4e5a61",
                fontSize: 16,
                lineHeight: 1.5,
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              A compact task board for tracking ownership, progress, and the work that still needs a person.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ background: "#182126", color: "#f6efe7", padding: 16 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontFamily: "'Segoe UI', sans-serif" }}>
                Total
              </div>
              <div style={{ fontSize: 28, marginTop: 8 }}>{tasks.length}</div>
            </div>
            <div style={{ background: "#dfe8dc", padding: 16 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#53615d", fontFamily: "'Segoe UI', sans-serif" }}>
                Open
              </div>
              <div style={{ fontSize: 28, marginTop: 8 }}>{tasks.filter((task) => task.status === "open").length}</div>
            </div>
            <div style={{ background: "#ead9ca", padding: 16 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#735a45", fontFamily: "'Segoe UI', sans-serif" }}>
                Unassigned
              </div>
              <div style={{ fontSize: 28, marginTop: 8 }}>{tasks.filter((task) => task.assignee_id === null).length}</div>
            </div>
          </div>

          <NewTaskForm onCreated={load} users={users} />

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              style={{
                flex: "1 1 240px",
                padding: "12px 14px",
                border: "1px solid #cbbfb2",
                background: "#fffdf9",
                color: "#182126",
                fontSize: 15,
              }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "12px 14px",
                border: "1px solid #cbbfb2",
                background: "#fffdf9",
                color: "#182126",
                fontSize: 15,
              }}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              style={{
                padding: "12px 14px",
                border: "1px solid #cbbfb2",
                background: "#fffdf9",
                color: "#182126",
                fontSize: 15,
              }}
            >
              <option value="">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={String(user.id)}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <TaskList
            tasks={tasks}
            users={users}
            updatingTaskIds={updatingTaskIds}
            onToggle={handleToggle}
            onAssigneeChange={handleAssigneeChange}
          />
        </div>
      </div>
    </div>
  );
}
