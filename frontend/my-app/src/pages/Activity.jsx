import { useEffect, useState, useCallback } from "react";
import "./Activity.css";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const { socket } = useSocket();

  // Safe fallback
  const localName =
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    "Unknown User";

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      let url = "/activities";

      if (selectedProject !== "all") {
        url += `?projectId=${selectedProject}`;
      }

      const res = await api.get(url);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
    fetchActivities();
  }, [fetchActivities]);

  // Real-time activity listener
  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (activity) => {
      if (!activity) return;

      // Check if activity matches current project filter
      if (selectedProject === "all" || activity.projectId === selectedProject) {
        setActivities((prev) => {
          if (prev.some((a) => a._id === activity._id)) return prev;
          return [activity, ...prev];
        });
      }
    };

    const handleTaskEvent = ({ activity } = {}) => {
      if (activity) handleNewActivity(activity);
    };

    socket.on("activity:new", handleNewActivity);
    socket.on("task:created", handleTaskEvent);
    socket.on("task:updated", handleTaskEvent);

    return () => {
      socket.off("activity:new", handleNewActivity);
      socket.off("task:created", handleTaskEvent);
      socket.off("task:updated", handleTaskEvent);
    };
  }, [socket, selectedProject]);

  const getIcon = (type) => {
    if (type === "completed") return "✅";
    if (type === "assigned") return "👤";
    if (type === "updated") return "✏️";
    if (type === "created") return "🆕";
    return "📌";
  };

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h2>Activity Log</h2>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="project-filter"
        >
          <option value="all">All Projects</option>

          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="activity-timeline">
        {activities.length === 0 && (
          <p className="no-activity">No activities found</p>
        )}

        {activities.map((a) => (
          <div key={a._id} className="activity-item">
            <div className="activity-icon">
              {getIcon(a.type)}
            </div>

            <div className="activity-card">
              <div className="activity-user">
                <img
                  src={a.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.user?.name || "U")}`}
                  alt="user"
                />

                <div>
                  <h4>
                    {a.user?.name || localName}
                  </h4>

                  <span>
                    {a.projectName || "General"}
                  </span>
                </div>
              </div>

              <div className="activity-content">
                <p className="activity-text">
                  {a.message}
                </p>
              </div>

              <div className="activity-time">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Activity;

