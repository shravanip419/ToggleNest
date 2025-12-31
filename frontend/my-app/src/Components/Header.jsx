import "./Header.css";
import { useState, useEffect } from "react"; 

const Header = () => {
  
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const darkMode = savedTheme === 'dark';
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="header">
      <div className="header-left">
        <h2>Plantwise</h2>
        <p>Complete overhaul of the company website</p>
      </div>
      <div className="header-right">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search...." />
        </div>

       
        <button className="theme-toggle-header" onClick={toggleTheme} title="Toggle Theme">
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className="notification">
          🔔
          <span className="dot"></span>
        </div>

        <div className="profile">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Y9EWzFriZ9_9L3xd6uHv3CWJBBuwu6f9PA&s"
            alt="profile"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
