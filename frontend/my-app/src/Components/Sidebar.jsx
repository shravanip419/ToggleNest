import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

import dashboardIcon from "../assets/Dashboard.png";
import activityIcon from "../assets/Activity.png";
import settingsIcon from "../assets/Settings.png";
import projectsIcon from "../assets/Projects.png";

import ProjectForm from "../pages/ProjectForm";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isExpandedRoute =
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/board");

  const [collapsed, setCollapsed] = useState(!isExpandedRoute);
  const [manualToggle, setManualToggle] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Auto collapse/expand on route change
  useEffect(() => {
    if (!manualToggle) setCollapsed(!isExpandedRoute);
  }, [location.pathname]);

  // Reset manual override when route changes
  useEffect(() => {
    setManualToggle(false);
  }, [location.pathname]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    fetchProjects();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
    setManualToggle(true);
  };

  const saveProject = async (projectData) => {
    try {
      const { data } = await api.post("/projects", projectData);
      setProjects(prev => [data, ...prev]);
      setShowProjectForm(false);
    } catch (err) {
      console.error("Create project failed", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* TOP */}
      <div className="sidebar-top">
        <div className="brand" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <div className="logo">T</div>
          {!collapsed && <span>ToggleNest</span>}
        </div>

        <button className="collapse-toggle" onClick={toggleSidebar}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* NAV */}
      <nav className="nav">
        <NavLink to="/home" className="nav-item">
          <img src={dashboardIcon} alt="Dashboard" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/board" className="nav-item">
          <img src={projectsIcon} alt="Projects" />
          {!collapsed && <span>Projects</span>}
        </NavLink>

        <NavLink to="/activity" className="nav-item">
          <img src={activityIcon} alt="Activity" />
          {!collapsed && <span>Activity</span>}
        </NavLink>

        <NavLink to="/settings" className="nav-item">
          <img src={settingsIcon} alt="Settings" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* PROJECTS */}
      {!collapsed && (
        <div className="projects">
          <div className="projects-header">
            <span>PROJECTS</span>
            <button
              className="add-project-btn"
              onClick={() => setShowProjectForm(true)}
              title="Add Project"
            >
              ＋
            </button>
          </div>

          {showProjectForm && (
            <div style={{ padding: "8px 0" }}>
              <ProjectForm
                onSave={saveProject}
                onCancel={() => setShowProjectForm(false)}
              />
            </div>
          )}

          {projects.map(project => (
            <NavLink
              key={project._id}
              to={`/board/${project._id}`}
              className={({ isActive }) =>
                `project-item ${isActive ? "active" : ""}`
              }
            >
              <span className={`dot ${project.color || "blue"}`} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.name}
              </span>
            </NavLink>
          ))}
        </div>
      )}

      {/* BOTTOM LOGOUT */}
      <div style={{ marginTop: "auto", padding: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#ef4444",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px"
          }}
          title="Log out"
        >
          <span>🚪</span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

