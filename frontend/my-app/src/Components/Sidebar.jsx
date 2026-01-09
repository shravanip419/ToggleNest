import { useState } from "react";
import { Link } from "react-router-dom";
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
          <div className="logo-icon">T</div>
          {!collapsed && <span>ToggleNest</span>}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="nav">
       <Link to='/'className="nav-item"> 
          🟦 {!collapsed && <span>Dashboard</span>}
        </Link>

        <Link className="nav-item">
          📁 {!collapsed && <span>Projects</span>}
        </Link>

         <Link to="/activity" className="nav-item">
        📈 {!collapsed && <span>Activity</span>}
          
        </Link>
        
       
        <Link to='/setting' className="nav-item">
          ⚙️ {!collapsed && <span>Settings</span>}
        </Link>
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
    <span className="avatar">A</span>

    <div className="user-info">
      <p className="name">Mern</p>
      <p className="email">success.com</p>
    </div>
  </div>

      )}
    </div>
  );
};

export default Sidebar;
