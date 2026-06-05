import { useState } from "react";
import { createTask, type User } from "../api.js";

export function NewTaskForm({
  onCreated,
  users,
}: {
  onCreated: () => void;
  users: User[];
}) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask(title.trim(), assigneeId ? Number(assigneeId) : null);
      setTitle("");
      setAssigneeId("");
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap",
        padding: 16,
        background: "rgba(255, 255, 255, 0.55)",
        border: "1px solid rgba(24, 33, 38, 0.08)",
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        disabled={isSubmitting}
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
        value={assigneeId}
        disabled={isSubmitting}
        onChange={(e) => setAssigneeId(e.target.value)}
        style={{
          padding: "12px 14px",
          border: "1px solid #cbbfb2",
          background: "#fffdf9",
          color: "#182126",
          fontSize: 15,
        }}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={String(user.id)}>
            {user.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "12px 18px",
          border: "none",
          background: isSubmitting ? "#8c918f" : "#182126",
          color: "#fff8f0",
          fontSize: 14,
          cursor: isSubmitting ? "default" : "pointer",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        Add
      </button>
    </form>
  );
}
