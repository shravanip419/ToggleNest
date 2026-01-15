import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="dashboard">
        {/* STATS CARDS */}
        <section className="stats">
          <div className="stat-card stat-purple">
            <div className="stat-info">
              <h4>Total Projects</h4>
              <h1>3</h1>
            </div>
            <div className="stat-icon">📁</div>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-info">
              <h4>Tasks Completed</h4>
              <h1>2</h1>
              <span className="trend-up">↑ 12% from last week</span>
            </div>
            <div className="stat-icon">✅</div>
          </div>

          <div className="stat-card stat-yellow">
            <div className="stat-info">
              <h4>Tasks Pending</h4>
              <h1>6</h1>
            </div>
            <div className="stat-icon">🕒</div>
          </div>

          <div className="stat-card stat-gray">
            <div className="stat-info">
              <h4>Team Productivity</h4>
              <h1>87%</h1>
              <span className="trend-up">↑ 5% from last week</span>
            </div>
            <div className="stat-icon">📈</div>
          </div>
        </section>

        {/* PROJECTS + ACTIVITY GRID */}
        <section className="grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Your Projects</h3>
              <a href="#">View all</a>
            </div>
            <div className="project-grid">
              <div className="project-card-v2">
                <div className="project-icon icon-purple">W</div>
                <div className="project-details">
                  <h4>Website Redesign</h4>
                  <p>Complete overhaul of the co...</p>
                  <span>12 tasks</span>
                </div>
              </div>

              <div className="project-card-v2">
                <div className="project-icon icon-green">M</div>
                <div className="project-details">
                  <h4>Mobile App MVP</h4>
                  <p>First version of the mobile ap...</p>
                  <span>8 tasks</span>
                </div>
              </div>

              <div className="project-card-v2">
                <div className="project-icon icon-yellow">M</div>
                <div className="project-details">
                  <h4>Marketing Campaign</h4>
                  <p>Q1 2024 marketing initiatives</p>
                  <span>5 tasks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Recent Activity</h3>
              <a href="#">View all</a>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-avatar">👤</div>
                <div className="activity-text">
                  <strong>Sarah Chen</strong> completed <strong>Homepage hero section</strong>
                  <span>Moved to Done</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-avatar">👤</div>
                <div className="activity-text">
                  <strong>Alex Johnson</strong> updated <strong>User authentication flow</strong>
                  <span>Changed status to In Progress</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-avatar">👤</div>
                <div className="activity-text">
                  <strong>Marcus Williams</strong> assigned <strong>Analytics dashboard</strong>
                  <span>Assigned to Marcus Williams</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;