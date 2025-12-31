import './Setting.css';
import { useState } from 'react';
import { MdPersonOutline, MdEdit } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdOutlineSecurity, MdLockOutline } from "react-icons/md";
import { MdOutlineContactSupport } from "react-icons/md";
import Sidebar from './Sidebar';
import Header from './Header';

function Setting() {
  const [activeSection, setActiveSection] = useState(null);
  const [user, setUser] = useState({
    name: 'Himanshu Patil',
    email: 'himanshu@example.com',
    notifications: { email: true, push: true }
  });

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="activity-layout">
      <Sidebar />
      <div className="main-section">
        <Header />
        <div className="settings-dashboard">
          {/* HEADER */}
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Customize your ToggleNest experience</p>
          </div>

          {/* PROFILE SECTION */}
          <div className="settings-card">
            <div className="settings-card-header" onClick={() => toggleSection('profile')}>
              <div className="icon"><MdPersonOutline /></div>
              <h3>Profile</h3>
              <MdEdit className="chevron" />
            </div>
            {activeSection === 'profile' && (
              <div className="settings-card-content">
                <div className="profile-editor">
                  <img src="https://via.placeholder.com/80" alt="Avatar" className="avatar" />
                  <div className="profile-info">
                    <input defaultValue={user.name} className="profile-input" />
                    <input defaultValue={user.email} className="profile-input" />
                    <button className="save-btn">Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
{/* NOTIFICATIONS  */}
<div className="settings-card">
  <div className="settings-card-header" onClick={() => toggleSection('notifications')}>
    <div className="icon"><IoIosNotificationsOutline /></div>
    <h3>Notifications</h3>
    <MdEdit className="chevron" />
  </div>
  {activeSection === 'notifications' && (
    <div className="settings-card-content">
      <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={user.notifications.email}
          onChange={(e) => {
            setUser(prev => ({
              ...prev,
              notifications: { ...prev.notifications, email: e.target.checked }
            }));
          }}
        />
        <span className="switch-slider"></span>
        Email Notifications
      </label>
      <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={user.notifications.push}
          onChange={(e) => {
            setUser(prev => ({
              ...prev,
              notifications: { ...prev.notifications, push: e.target.checked }
            }));
          }}
        />
        <span className="switch-slider"></span>
        Push Notifications
      </label>
    </div>
  )}
</div>


          {/* SECURITY */}
          <div className="settings-card">
            <div className="settings-card-header" onClick={() => toggleSection('security')}>
              <div className="icon"><MdOutlineSecurity /></div>
              <h3>Security</h3>
              <MdEdit className="chevron" />
            </div>
            {activeSection === 'security' && (
              <div className="settings-card-content">
                <div className="security-grid">
                  {/* Password Change */}
                  <div className="security-panel full-width">
                    <h4><MdLockOutline /> Change Password</h4>
                    <div className="password-form">
                      <input placeholder="Current Password" type="password" />
                      <input placeholder="New Password" type="password" />
                      <input placeholder="Confirm New Password" type="password" />
                      <button className="save-btn">Update Password</button>
                    </div>
                  </div>
                  {/* Active Sessions */}
                  <div className="security-panel">
                    <h4>Active Sessions</h4>
                    <div className="session-list">
                      <div className="session-item">
                        <span>Chrome • Windows</span>
                        <span className="session-time">2 hours ago</span>
                        <button className="logout-btn">Logout</button>
                      </div>
                      <div className="session-item">
                        <span>Mobile App • Android</span>
                        <span className="session-time">1 day ago</span>
                        <button className="logout-btn">Logout</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HELP */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="icon"><MdOutlineContactSupport /></div>
              <h3>Help & Support</h3>
            </div>
            <div className="settings-card-content">
              <p>Need help? Contact us at support@togglenest.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
