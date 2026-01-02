import "./Header.css";

const Header = () => {
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
