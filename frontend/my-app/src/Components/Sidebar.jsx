import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

import dashboardIcon from "../assets/Dashboard.png";
import projectsIcon from "../assets/Projects.png";
import activityIcon from "../assets/Activity.png";
import settingsIcon from "../assets/Settings.png";

const Sidebar = () => {
  const location = useLocation();

  // Routes where sidebar should be expanded by default
  const expandedRoutes = ["/home", "/projects"];
  const isExpandedRoute = expandedRoutes.includes(location.pathname);

  const [collapsed, setCollapsed] = useState(!isExpandedRoute);
  const [manualToggle, setManualToggle] = useState(false);

  // Sync sidebar state on route change
  useEffect(() => {
    if (!manualToggle) {
      setCollapsed(!isExpandedRoute);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
    setManualToggle(true);
  };

  const projectsData = [
    { id: 1, name: "Website Redesign", color: "blue" },
    { id: 2, name: "Mobile App MVP", color: "green" },
    { id: 3, name: "Marketing Campaign", color: "orange" },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* TOP */}
      <div className="sidebar-top">
        <div className="brand">
          <div className="logo">T</div>
          {!collapsed && <span>ToggleNest</span>}
        </div>

        <button
          className="collapse-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* NAV */}
      <nav className="nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <img src={dashboardIcon} alt="Dashboard" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/board"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <img src={projectsIcon} alt="Projects" />
          {!collapsed && <span>Projects</span>}
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <img src={activityIcon} alt="Activity" />
          {!collapsed && <span>Activity</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <img src={settingsIcon} alt="Settings" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* PROJECTS */}
      {!collapsed && (
        <div className="projects">
          <div className="projects-header">
            <span>PROJECTS</span>
            <button className="add-project-btn">＋</button>
          </div>

          {projectsData.map((project) => (
            <div key={project.id} className="project-item">
              <span className={`dot ${project.color}`} />
              {project.name}
            </div>
          ))}
        </div>
      )}

      {/* PROFILE */}
      <div className="sidebar-profile">
        <img src="https://i.pravatar.cc/40" alt="user" />
        {!collapsed && (
          <div className="profile-info">
            <div className="name">Alex Johnson</div>
            <div className="email">alex@togglenest.com</div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
