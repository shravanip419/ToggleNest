import { useState } from "react";
import "./sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return <>
 
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

          <div className="project">
            <span className="dot purple"></span>
            Website Redesign
          </div>

          <div className="project">
            <span className="dot green"></span>
            Mobile App MVP
          </div>

          <div className="project">
            <span className="dot orange"></span>
            Marketing Campaign
          </div>
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
    </div></>
   
    
  
};

export default Sidebar;
