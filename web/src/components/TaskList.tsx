import type { Task, User } from "../api.js";

export function TaskList({
  tasks,
  users,
  updatingTaskIds,
  onToggle,
  onAssigneeChange,
}: {
  tasks: Task[];
  users: User[];
  updatingTaskIds: number[];
  onToggle: (task: Task) => void;
  onAssigneeChange: (task: Task, assigneeId: number | null) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p
        style={{
          color: "#5e696d",
          padding: 18,
          background: "rgba(255, 255, 255, 0.5)",
          border: "1px solid rgba(24, 33, 38, 0.08)",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        No tasks match the current filters.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(24, 33, 38, 0.08)",
            background: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <input
            type="checkbox"
            checked={task.status === "done"}
            disabled={updatingTaskIds.includes(task.id)}
            onChange={() => onToggle(task)}
            style={{ width: 18, height: 18, marginTop: 3, accentColor: "#314e47" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                textDecoration: task.status === "done" ? "line-through" : "none",
                color: task.status === "done" ? "#7d8588" : "#182126",
                fontSize: 18,
                lineHeight: 1.25,
              }}
            >
              {task.title}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                color: "#5e696d",
                fontSize: 13,
                marginTop: 8,
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              <span>{task.assignee_name ?? "Unassigned"}</span>
              <span
                style={{
                  padding: "2px 8px",
                  background: task.status === "done" ? "#dbe3df" : "#efe1d2",
                  color: task.status === "done" ? "#44524e" : "#725640",
                }}
              >
                {task.status}
              </span>
            </div>
          </div>
          <select
            value={task.assignee_id === null ? "" : String(task.assignee_id)}
            disabled={updatingTaskIds.includes(task.id)}
            onChange={(e) =>
              onAssigneeChange(
                task,
                e.target.value ? Number(e.target.value) : null
              )
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #cbbfb2",
              background: "#fffdf9",
              color: "#182126",
              fontSize: 14,
              minWidth: 140,
            }}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={String(user.id)}>
                {user.name}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
