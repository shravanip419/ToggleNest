import { useState } from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const projectsData = [
    { id: 1, name: "Plantwise" },
    { id: 2, name: "CampusEats" },
    { id: 3, name: "DeepFake" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top">
        <div className="logo">
          <div className="logo-icon">C</div>
          {!collapsed && <span>Collabix</span>}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="nav">
        <div className="nav-item">
          🟦 {!collapsed && <span>Dashboard</span>}
        </div>
        <div className="nav-item">
          📁 {!collapsed && <span>Projects</span>}
        </div>
        <div className="nav-item">
          📈 {!collapsed && <span>Activity</span>}
        </div>
        <div className="nav-item">
          ⚙️ {!collapsed && <span>Settings</span>}
        </div>
      </nav>

      {!collapsed && (
        <div className="projects">
          <p className="projects-title">PROJECTS</p>

          {projectsData.map((project) => (
            <div className="project" key={project.id}>
              <span className="dot"></span>
              {project.name}
            </div>
          ))}
        </div>
      )}

      {!collapsed && (
        <div className="user">
          <div className="avatar">A</div>
          <div>
            <p className="name">Mern</p>
            <p className="email">success.com</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
