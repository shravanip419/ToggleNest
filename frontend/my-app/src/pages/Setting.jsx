import React, { useState } from "react";
import "./Setting.css";
import { Link, Outlet, useLocation } from "react-router-dom";

import {
  MdPersonOutline,
  MdEdit,
  MdOutlineSecurity,
  MdOutlineContactSupport,
  MdArrowBack,
  MdOutlineEmail,
  MdDesktopWindows,
  MdTaskAlt,
  MdPhoneIphone,
  MdLaptopChromebook,
  MdVisibility,
  MdVisibilityOff
} from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

const Setting =({title, subtitle})=> {
  const location = useLocation();
  const isRootSettings = location.pathname === "/settings";
  const [currentView, setCurrentView] = useState("main");

  // Notification State
  const [notifications, setNotifications] = useState({
    email: true,
    taskUpdates: false,
    desktop: true
  });

  // Password Visibility States
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePassVisibility = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const renderContent = () => {
    if (currentView === "notifications") {
      return (
        <div className="sub-view-container">
          <button className="back-btn" onClick={() => setCurrentView("main")}>
            <MdArrowBack /> Back to Settings
          </button>

          <div className="sub-settings-card">
            <h2 className="view-title">Notifications</h2>
            <hr className="title-divider" />
            
            <div className="setting-item">
              <div className="item-info">
                <MdOutlineEmail className="item-icon" />
                <div>
                  <h4>Email Alerts</h4>
                  <p>Receive updates via email</p>
                </div>
              </div>
              <div 
                className={`custom-toggle ${notifications.email ? 'active' : ''}`} 
                onClick={() => handleToggle('email')}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="item-info">
                <MdTaskAlt className="item-icon" />
                <div>
                  <h4>Task Updates</h4>
                  <p>Notify when tasks are updated</p>
                </div>
              </div>
              <div 
                className={`custom-toggle ${notifications.taskUpdates ? 'active' : ''}`} 
                onClick={() => handleToggle('taskUpdates')}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="item-info">
                <MdDesktopWindows className="item-icon" />
                <div>
                  <h4>Desktop Notifications</h4>
                  <p>Push notifications on desktop</p>
                </div>
              </div>
              <div 
                className={`custom-toggle ${notifications.desktop ? 'active' : ''}`} 
                onClick={() => handleToggle('desktop')}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === "security") {
      return (
        <div className="sub-view-container">
          <button className="back-btn" onClick={() => setCurrentView("main")}>
            <MdArrowBack /> Back to Settings
          </button>

          <div className="sub-settings-card">
            <h2 className="view-title">Security</h2>
            <hr className="title-divider" />

            <div className="security-section">
              <h3>Change Password</h3>
              <form className="password-form" onSubmit={(e) => e.preventDefault()}>
                <div className="password-input-wrapper">
                  <input 
                    type={showPass.current ? "text" : "password"} 
                    placeholder="Current Password" 
                  />
                  <span onClick={() => togglePassVisibility('current')}>
                    {showPass.current ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                <div className="password-input-wrapper">
                  <input 
                    type={showPass.new ? "text" : "password"} 
                    placeholder="New Password" 
                  />
                  <span onClick={() => togglePassVisibility('new')}>
                    {showPass.new ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                <div className="password-input-wrapper">
                  <input 
                    type={showPass.confirm ? "text" : "password"} 
                    placeholder="Confirm New Password" 
                  />
                  <span onClick={() => togglePassVisibility('confirm')}>
                    {showPass.confirm ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                <button className="update-btn">Update Password</button>
              </form>
            </div>

            <div className="security-section" style={{ marginTop: '40px' }}>
              <h3>Logged-in Devices</h3>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-icon-box"><MdLaptopChromebook /></div>
                  <div className="session-details">
                    <div className="session-name">Chrome on Windows</div>
                    <div className="session-status">(Current Session)</div>
                  </div>
                </div>
                <div className="session-item">
                  <div className="session-icon-box"><MdPhoneIphone /></div>
                  <div className="session-details">
                    <div className="session-name">Mobile App (iPhone)</div>
                    <div className="session-status">Active 2h ago</div>
                  </div>
                </div>
              </div>
              <button className="logout-all-btn">Log out of all other sessions</button>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === "help") {
      return (
        <div className="sub-view-container">
          <button className="back-btn" onClick={() => setCurrentView("main")}>
            <MdArrowBack /> Back to Settings
          </button>

          <div className="sub-settings-card">
            <h2 className="view-title">Help & Support</h2>
            <hr className="title-divider" />

            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-item">
                <div className="faq-question">How do I reset my password?</div>
                <div className="faq-answer">Go to the Security tab and fill out the Change Password form.</div>
              </div>
              <div className="faq-item">
                <div className="faq-question">Can I manage multiple workspaces?</div>
                <div className="faq-answer">Yes, you can switch workspaces from the sidebar menu.</div>
              </div>
            </div>

            <div className="support-contact-box">
              <p>Still need help?</p>
              <h3>Contact Support</h3>
              <p className="phone-no">+91 98765 43210</p>
              <p className="timings">(Mon-Fri, 9am - 6pm)</p>
            </div>
          </div>
        </div>
      );
    }

    // Default Main View
    return (
      <div className="settings-dashboard">
        <div className="settings-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <Link to="profile" className="settings-card link-reset">
          <div className="settings-card-header">
            <div className="icon"><MdPersonOutline /></div>
            <h3>Profile</h3>
            <MdEdit className="chevron" />
          </div>
        </Link>

        <div className="settings-card" onClick={() => setCurrentView("notifications")} role="button">
          <div className="settings-card-header">
            <div className="icon"><IoIosNotificationsOutline /></div>
            <h3>Notifications</h3>
            <MdEdit className="chevron" />
          </div>
        </div>

        <div className="settings-card" onClick={() => setCurrentView("security")} role="button">
          <div className="settings-card-header">
            <div className="icon"><MdOutlineSecurity /></div>
            <h3>Security</h3>
            <MdEdit className="chevron" />
          </div>
        </div>

        <div className="settings-card" onClick={() => setCurrentView("help")} role="button">
          <div className="settings-card-header">
            <div className="icon"><MdOutlineContactSupport /></div>
            <h3>Help & Support</h3>
            <MdEdit className="chevron" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="activity-layout">
      <div className="main-section">
        {isRootSettings ? renderContent() : <Outlet />}
      </div>
    </div>
  );
}

export default Setting;