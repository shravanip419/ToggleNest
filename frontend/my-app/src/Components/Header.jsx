import "./Header.css";
import { useState, useEffect } from "react"; 
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Header = ({ title, subtitle }) => {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const darkMode = savedTheme === 'dark';
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data } = await api.get("/activities/recent?limit=5");
        setNotifications(data || []);
      } catch (err) {
        // silently catch if unauth
      }
    };

    if (user) {
      fetchRecentActivities();
    }
  }, [user]);

  // Click outside to close menus
  useEffect(() => {
    const closeMenus = () => {
      setShowUserMenu(false);
      setShowNotifMenu(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="header-wrapper">
      <header className="topbar">
        <div className="header-info">
          <h1>{title || "Dashboard"}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}
        </div>

        <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Notifications Popover */}
          <div style={{ position: "relative" }}>
            <div
              className="notification-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              style={{ cursor: "pointer" }}
              title="Notifications"
            >
              🔔{notifications.length > 0 && <span className="notif-dot"></span>}
            </div>

            {showNotifMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "38px",
                  width: "300px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  padding: "12px",
                  zIndex: 100,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Recent Activity</h4>
                  <Link to="/activity" onClick={() => setShowNotifMenu(false)} style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none" }}>
                    View all
                  </Link>
                </div>
                <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#9ca3af", margin: "10px 0", textAlign: "center" }}>
                      No recent notifications
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid #f3f4f6",
                          fontSize: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px"
                        }}
                      >
                        <span style={{ fontWeight: "500", color: "#1f2937" }}>{notif.message}</span>
                        <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                          {notif.projectName} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div style={{ position: "relative" }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                userSelect: "none",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
              title={user?.name || "Account"}
            >
              {userInitial}
            </div>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "42px",
                  width: "200px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  padding: "8px 0",
                  zIndex: 100,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: "8px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", color: "#111827" }}>
                    {user?.name || "User"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email || ""}
                  </p>
                </div>

                <Link
                  to="/settings/profile"
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    fontSize: "13px",
                    color: "#374151",
                    textDecoration: "none"
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  👤 Profile
                </Link>

                <Link
                  to="/settings"
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    fontSize: "13px",
                    color: "#374151",
                    textDecoration: "none"
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  ⚙️ Settings
                </Link>

                <div style={{ borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    fontSize: "13px",
                    color: "#ef4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;