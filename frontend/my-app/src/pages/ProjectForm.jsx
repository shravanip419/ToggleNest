import { useState } from "react";
import "./ProjectForm.css";

const ProjectForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => { // Added async
    e.preventDefault();
    if (!name.trim()) return;

    await onSave(name); // Wait for the API call to finish
    setName("");
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="project-form-actions">
        <button type="submit">Add</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProjectForm;
