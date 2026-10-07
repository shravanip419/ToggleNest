import { useState, useEffect } from "react";
import "./TaskForm.css";

const TaskForm = ({ onClose, onSave, onDelete, defaultStatus = "todo", initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [status, setStatus] = useState(initialData?.status || defaultStatus);
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [assignee, setAssignee] = useState(initialData?.assignee || "");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setStatus(initialData.status || "todo");
      setPriority(initialData.priority || "medium");
      setDueDate(initialData.dueDate || "");
      setAssignee(initialData.assignee || "");
      setDescription(initialData.description || "");
    } else {
      setStatus(defaultStatus);
    }
  }, [defaultStatus, initialData]);

  const handleSave = (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      status,
      priority,
      dueDate,
      assignee: assignee.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h3>{initialData ? "Edit Task" : "New Task"}</h3>
          <button onClick={onClose} type="button" style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="task-form-body">
            <label>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement User Authentication"
              required
              autoFocus
            />

            <div className="row">
              <div>
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div>
                <label>Assignee</label>
                <input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="e.g. Alex Smith"
                />
              </div>

              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra details, acceptance criteria, or notes..."
              rows="4"
            />
          </div>

          <div className="task-form-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData._id)}
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  🗑️ Delete Task
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="save">{initialData ? "Save Changes" : "Create Task"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

