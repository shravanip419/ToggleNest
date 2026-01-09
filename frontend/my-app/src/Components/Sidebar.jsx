<<<<<<< Updated upstream
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

=======
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

import dashboardIcon from "../assets/Dashboard.png";
import projectsIcon from "../assets/Projects.png";
import activityIcon from "../assets/Activity.png";
import settingsIcon from "../assets/Settings.png";
>>>>>>> Stashed changes

const Sidebar = () => {
  const location = useLocation();

  // Routes where sidebar should be EXPANDED by default
  const expandedRoutes = ["/home", "/projects"];

  const isExpandedRoute = expandedRoutes.includes(location.pathname);

  // local UI state
  const [collapsed, setCollapsed] = useState(!isExpandedRoute);

  // 🔑 Sync sidebar state when route changes
  useEffect(() => {
    setCollapsed(!isExpandedRoute);
  }, [isExpandedRoute]);

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
          onClick={() => setCollapsed(!collapsed)}
        >
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

      {/* PROJECTS LIST (only in expanded mode) */}
      {!collapsed && (
        <div className="projects">
          <div className="projects-header">
            <span>PROJECTS</span>
            <button className="add-project-btn">＋</button>
          </div>

          {projectsData.map((p) => (
            <div key={p.id} className="project-item">
              <span className={`dot ${p.color}`} />
              {p.name}
            </div>
          ))}
        </div>
      )}

<<<<<<< Updated upstream
      {!collapsed && (
          <div className="user">
    <span className="avatar">A</span>

    <div className="user-info">
      <p className="name">Mern</p>
      <p className="email">success.com</p>
    </div>
  </div>

      )}
    </div>
=======
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
>>>>>>> Stashed changes
  );
};

export default Sidebar;
