import { useState } from "react";
import "./TaskForm.css";

const TaskForm = ({ onClose, onSave, defaultStatus }) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState("high");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      status,
      priority,
      dueDate,
      assignee,
      description
    });
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <div className="task-form-header">
          <h3>{title || "New Task"}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="task-form-body">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />

          <div className="row">
            <div>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div>
              <label>Assignee</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Assignee"
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
            placeholder="Task description"
          />
        </div>

        <div className="task-form-footer">
          <button className="cancel" onClick={onClose}>Cancel</button>
          <button className="save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
