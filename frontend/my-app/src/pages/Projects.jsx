import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectForm from "./ProjectForm";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close card menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        const response = await api.put(`/projects/${editingProject._id}`, projectData);
        setProjects((prev) =>
          prev.map((p) => (p._id === editingProject._id ? { ...p, ...response.data } : p))
        );
        setEditingProject(null);
      } else {
        const response = await api.post("/projects", projectData);
        setProjects((prev) => [response.data, ...prev]);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Error saving project:", err.response?.data || err.message);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks will also be deleted.")) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="projects-container">
      <header className="projects-header">
        <div className="header-left">
          <h1>Projects</h1>
          <p>Manage and track all your team projects</p>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            className="add-project-btn"
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
            title="Create Project"
          >
            +
          </button>
        </div>
      </header>

      {(showForm || editingProject) && (
        <div className="form-overlay" onClick={() => { setShowForm(false); setEditingProject(null); }}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProject ? "Edit Project" : "Create New Project"}</h3>
            <ProjectForm
              initialData={editingProject}
              onSave={handleSaveProject}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      )}

      <section className="projects-section">
        <h2>All Projects ({filteredProjects.length})</h2>
        {loading ? (
          <p style={{ color: "#6b7280", padding: "20px 0" }}>Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <p style={{ fontSize: "16px", marginBottom: "12px" }}>
              {searchQuery ? "No projects match your search." : "No projects created yet."}
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: "#6366f1",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project, index) => {
              const cardColor = project.color || ["purple", "green", "orange", "blue", "pink"][index % 5];
              const total = project.totalTasks || 0;
              const completed = project.completedTasks || 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={project._id}
                  className={`project-card ${cardColor}`}
                  onClick={() => navigate(`/board/${project._id}`)}
                >
                  <div className="card-top">
                    <div className="project-icon">
                      {project.name.toLowerCase().includes("web") ? "🌐" : project.name.toLowerCase().includes("app") ? "📱" : "📁"}
                    </div>
                    <div style={{ position: "relative" }}>
                      <button
                        className="options-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project._id ? null : project._id);
                        }}
                      >
                        •••
                      </button>
                      {activeMenuId === project._id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "28px",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            borderRadius: "8px",
                            padding: "6px 0",
                            zIndex: 10,
                            minWidth: "110px"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#374151"
                            }}
                            onClick={() => {
                              setEditingProject(project);
                              setActiveMenuId(null);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#ef4444"
                            }}
                            onClick={(e) => handleDeleteProject(project._id, e)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{project.name}</h3>
                    <p>{project.description || "No project description provided."}</p>
                  </div>
                  <div className="card-footer">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>{completed}/{total} tasks ({percent}%)</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Projects;