import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import api from "../api/axios";

import dashboardIcon from "../assets/Dashboard.png";
import activityIcon from "../assets/Activity.png";
import settingsIcon from "../assets/Settings.png";
import projectsIcon from "../assets/Projects.png";

import ProjectForm from "../pages/ProjectForm";

const Sidebar = () => {
  const location = useLocation();

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

  // Create project (AUTH SAFE)
  const saveProject = async (name) => {
    try {
      const { data } = await api.post("/projects", { name });
      setProjects(prev => [...prev, data]);
      setShowProjectForm(false);
    } catch (err) {
      console.error("Create project failed", err);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* TOP */}
      <div className="sidebar-top">
        <div className="brand">
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
            >
              ＋
            </button>
          </div>

          {showProjectForm && (
            <ProjectForm
              onSave={saveProject}
              onCancel={() => setShowProjectForm(false)}
            />
          )}

          {projects.map(project => (
            <NavLink
              key={project._id}
              to={`/board/${project._id}`}
              className={({ isActive }) =>
                `project-item ${isActive ? "active" : ""}`
              }
            >
              <span className="dot blue" />
              {project.name}
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
