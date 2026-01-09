import "./Home.css";

const Home = ()=> {
  return (
    <div className="home-dashboard">
      {/* STATS CARDS */}
      <section className="stats">
        <div className="stat-card purple">
          <p>Total Projects</p>
          <h2>3</h2>
        </div>
        <div className="stat-card green">
          <p>Tasks Completed</p>
          <h2>2</h2>
          <span>↑ 12% from last week</span>
        </div>
        <div className="stat-card yellow">
          <p>Tasks Pending</p>
          <h2>6</h2>
        </div>
        <div className="stat-card">
          <p>Team Productivity</p>
          <h2>87%</h2>
          <span>↑ 5% from last week</span>
        </div>
      </section>

      {/* PROJECTS + ACTIVITY GRID */}
      <section className="grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Your Projects</h3>
            <a href="#">View all</a>
          </div>
          <div className="project-card">
            <strong>Website Redesign</strong>
            <p>Complete overhaul of the site</p>
            <span>12 tasks</span>
          </div>
          <div className="project-card">
            <strong>Mobile App MVP</strong>
            <p>First version of mobile app</p>
            <span>8 tasks</span>
          </div>
          <div className="project-card">
            <strong>Marketing Campaign</strong>
            <p>Q1 marketing initiatives</p>
            <span>5 tasks</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
            <a href="#">View all</a>
          </div>
          <div className="activity">
            <strong>Sarah Chen</strong> completed Homepage hero section
          </div>
          <div className="activity">
            <strong>Alex Johnson</strong> updated Authentication flow
          </div>
          <div className="activity">
            <strong>Marcus Williams</strong> assigned Analytics dashboard
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;