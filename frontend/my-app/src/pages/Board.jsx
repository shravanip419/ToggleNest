import "./Board.css";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskForm from "./TaskForm";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";

const Board = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected, activeUsers, joinProject, leaveProject, onKicked, onAccessDenied } =
    useSocket();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formStatus, setFormStatus] = useState("todo");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        api.get(`/tasks?projectId=${projectId}`),
        api.get(`/projects/${projectId}`),
      ]);

      setTasks(taskRes.data);
      setProject(projectRes.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        setAccessDenied(true);
        setAccessMessage(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "You do not have access to this project."
        );
      } else {
        console.error("Board load error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Join and leave project socket room
  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
    }
    return () => {
      if (projectId) {
        leaveProject(projectId);
      }
    };
  }, [projectId, joinProject, leaveProject]);

  // Register kick handler — when owner removes this user while they're viewing
  useEffect(() => {
    const cleanup = onKicked(({ projectId: kickedProjectId, message }) => {
      if (kickedProjectId === projectId) {
        setAccessDenied(true);
        setAccessMessage(message || "You have been removed from this project.");
      }
    });
    return cleanup;
  }, [projectId, onKicked]);

  // Register access denied handler (for socket room join rejection)
  useEffect(() => {
    const cleanup = onAccessDenied(({ projectId: deniedProjectId }) => {
      if (deniedProjectId === projectId) {
        setAccessDenied(true);
        setAccessMessage("You do not have access to this project.");
      }
    });
    return cleanup;
  }, [projectId, onAccessDenied]);

  // Socket event listeners for real-time collaboration
  useEffect(() => {
    if (!socket) return;

    // When another user creates a task
    const handleTaskCreated = ({ task }) => {
      if (task.project === projectId || task.project?._id === projectId) {
        setTasks((prev) => {
          if (prev.some((t) => t._id === task._id)) return prev;
          return [task, ...prev];
        });
      }
    };

    // When another user updates a task (moves column, edits title/priority/etc)
    const handleTaskUpdated = ({ task }) => {
      if (task.project === projectId || task.project?._id === projectId) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, ...task } : t))
        );
      }
    };

    // When another user deletes a task
    const handleTaskDeleted = ({ taskId, projectId: pId }) => {
      if (pId === projectId || !pId) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    };

    // When project details are updated (name, description, color)
    const handleProjectUpdated = ({ project: updatedProj }) => {
      if (updatedProj._id === projectId) {
        setProject((prev) => ({ ...prev, ...updatedProj }));
      }
    };

    // When this project is deleted by the owner
    const handleProjectDeleted = ({ projectId: deletedId }) => {
      if (deletedId?.toString() === projectId) {
        setAccessDenied(true);
        setAccessMessage("This project has been deleted by the owner.");
      }
    };

    // When a new member is added to the project (update presence info etc.)
    const handleMemberAdded = ({ projectId: pId }) => {
      // Re-fetch project to get updated member list
      if (pId?.toString() === projectId) {
        api.get(`/projects/${projectId}`).then(({ data }) => setProject(data)).catch(() => {});
      }
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("project:updated", handleProjectUpdated);
    socket.on("project:deleted", handleProjectDeleted);
    socket.on("project:member_added", handleMemberAdded);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("project:updated", handleProjectUpdated);
      socket.off("project:deleted", handleProjectDeleted);
      socket.off("project:member_added", handleMemberAdded);
    };
  }, [socket, projectId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    if (newStatus === oldStatus && destination.index === source.index) return;

    const previousTasks = [...tasks];

    // Optimistic UI update for instant responsive feedback
    setTasks((prev) =>
      prev.map((t) =>
        t._id.toString() === draggableId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await api.patch(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error("Drag update failed, rolling back", err);
      setTasks(previousTasks);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const { data } = await api.patch(`/tasks/${editingTask._id}`, taskData);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data : t)));
        setEditingTask(null);
      } else {
        const { data } = await api.post("/tasks", { ...taskData, projectId });
        setTasks((prev) => [data, ...prev]);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Save task failed", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setEditingTask(null);
    } catch (err) {
      console.error("Delete task failed", err);
      if (err.response?.status === 403) {
        alert("Only the task creator or project owner can delete this task.");
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  // ── Access Denied State ──────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
          gap: "16px",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "56px" }}>🔒</div>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
          Access Denied
        </h2>
        <p style={{ color: "#64748b", maxWidth: "380px", margin: 0, lineHeight: "1.6" }}>
          {accessMessage || "You do not have access to this project."}
        </p>
        <button
          onClick={() => navigate("/board")}
          style={{
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  if (loading)
    return <div className="board-loading">Loading Board...</div>;

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <div className="header-nav">
          <button onClick={() => navigate("/board")} className="back-btn">
            ← Projects
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1>{project?.name || "Project Board"}</h1>

              {/* Real-time Status & Presence Indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  backgroundColor: isConnected ? "#ecfdf5" : "#fef2f2",
                  color: isConnected ? "#059669" : "#dc2626",
                  border: `1px solid ${isConnected ? "#a7f3d0" : "#fecaca"}`,
                  fontWeight: "500",
                }}
                title={
                  isConnected
                    ? "Connected to real-time live sync"
                    : "Offline / Reconnecting"
                }
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: isConnected ? "#10b981" : "#ef4444",
                    display: "inline-block",
                    boxShadow: isConnected ? "0 0 6px #10b981" : "none",
                  }}
                />
                {isConnected ? "Live Sync" : "Connecting..."}
              </div>
            </div>

            {project?.description && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Board Search, Active Viewers, and Action Controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Active Viewers Presence Avatars */}
          {activeUsers.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "3px 10px",
                gap: "6px",
              }}
              title={`${activeUsers.length} user(s) currently viewing this project`}
            >
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                Viewing:
              </span>
              <div style={{ display: "flex", alignItems: "center", marginLeft: "2px" }}>
                {activeUsers.slice(0, 4).map((u, idx) => (
                  <div
                    key={u.userId || idx}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ffffff",
                      marginLeft: idx === 0 ? "0" : "-6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    title={`${u.name} (${u.email || "Active"})`}
                  >
                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                  </div>
                ))}
                {activeUsers.length > 4 && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginLeft: "4px",
                      fontWeight: "600",
                    }}
                  >
                    +{activeUsers.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              padding: "6px 12px",
              borderRadius: "8px",
            }}
          >
            <span style={{ marginRight: "6px" }}>🔍</span>
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", fontSize: "14px" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormStatus("todo");
              setShowForm(true);
            }}
            style={{
              backgroundColor: "#6366f1",
              color: "#fff",
              border: "none",
              padding: "7px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            + New Task
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          <Column
            title="To Do"
            status="todo"
            color="#6366f1"
            tasks={filteredTasks}
            onAdd={() => {
              setEditingTask(null);
              setFormStatus("todo");
              setShowForm(true);
            }}
            onCardClick={(task) => setEditingTask(task)}
          />

          <Column
            title="In Progress"
            status="in-progress"
            color="#7c3aed"
            tasks={filteredTasks}
            onAdd={() => {
              setEditingTask(null);
              setFormStatus("in-progress");
              setShowForm(true);
            }}
            onCardClick={(task) => setEditingTask(task)}
          />

          <Column
            title="Done"
            status="done"
            color="#22c55e"
            tasks={filteredTasks}
            onAdd={() => {
              setEditingTask(null);
              setFormStatus("done");
              setShowForm(true);
            }}
            onCardClick={(task) => setEditingTask(task)}
          />
        </div>
      </DragDropContext>

      {(showForm || editingTask) && (
        <TaskForm
          defaultStatus={formStatus}
          initialData={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

const Column = ({ title, status, color, tasks, onAdd, onCardClick }) => {
  const filtered = tasks.filter((t) => t.status === status);

  return (
    <div className="column">
      <div className="column-header">
        <div className="col-title">
          <span className="dot" style={{ backgroundColor: color }} />
          <h3>{title}</h3>
          <span className="count">{filtered.length}</span>
        </div>
        <button className="add-btn" onClick={onAdd} title={`Add task to ${title}`}>
          +
        </button>
      </div>

      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list"
          >
            {filtered.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onCardClick(task)}
                    style={{ ...provided.draggableProps.style, cursor: "grab" }}
                  >
                    <Card task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const Card = ({ task }) => (
  <div className="card" style={{ transition: "box-shadow 0.2s, transform 0.2s" }}>
    <h4>{task.title}</h4>
    {task.description && (
      <p
        style={{
          fontSize: "12px",
          color: "#6b7280",
          margin: "4px 0 8px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
        }}
      >
        {task.description}
      </p>
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className={`priority ${task.priority}`}>{task.priority}</span>
      {task.assignee && (
        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>
          👤 {task.assignee}
        </span>
      )}
    </div>

    <div className="card-footer" style={{ marginTop: "10px" }}>
      <span className="due-date">📅 {task.dueDate || "No date"}</span>
      <img
        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          task.assignee || task.title
        )}`}
        className="card-avatar"
        alt="avatar"
      />
    </div>
  </div>
);

export default Board;
