import { useState } from "react";
import "./ProjectForm.css";

const colors = [
  { id: "purple", label: "Purple", hex: "#6366f1" },
  { id: "green", label: "Green", hex: "#10b981" },
  { id: "orange", label: "Orange", hex: "#f59e0b" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
];

const ProjectForm = ({ onSave, onCancel, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [color, setColor] = useState(initialData?.color || "purple");

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!name.trim()) return;

    await onSave({
      name: name.trim(),
      description: description.trim(),
      color
    }); 
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <textarea
          placeholder="Project description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical"
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>Theme:</span>
          {colors.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setColor(c.id)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: c.hex,
                border: color === c.id ? "2px solid #000" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                outline: "none"
              }}
              title={c.label}
            />
          ))}
        </div>
      </div>
      <div className="project-form-actions" style={{ marginTop: "14px" }}>
        <button type="submit">{initialData ? "Save Changes" : "Create Project"}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProjectForm;

