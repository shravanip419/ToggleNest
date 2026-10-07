import "./Board.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskForm from "./TaskForm";
import api from "../api/axios";

const Board = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formStatus, setFormStatus] = useState("todo");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        api.get(`/tasks?projectId=${projectId}`),
        api.get(`/projects`)
      ]);

      setTasks(taskRes.data);
      const foundProject = projectRes.data.find(p => p._id === projectId);
      setProject(foundProject);
    } catch (err) {
      console.error("Board load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    if (newStatus === oldStatus && destination.index === source.index) return;

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t._id.toString() === draggableId
          ? { ...t, status: newStatus }
          : t
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
        setTasks(prev => prev.map(t => (t._id === editingTask._id ? data : t)));
        setEditingTask(null);
      } else {
        const { data } = await api.post("/tasks", { ...taskData, projectId });
        setTasks(prev => [data, ...prev]);
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
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setEditingTask(null);
    } catch (err) {
      console.error("Delete task failed", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  if (loading) return <div className="board-loading">Loading Board...</div>;

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <div className="header-nav">
          <button onClick={() => navigate("/board")} className="back-btn">
            ← Projects
          </button>
          <div>
            <h1>{project?.name || "Project Board"}</h1>
            {project?.description && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Board Search & Priority Filter Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: "8px" }}>
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
              cursor: "pointer"
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
              fontSize: "13px"
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
  const filtered = tasks.filter(t => t.status === status);

  return (
    <div className="column">
      <div className="column-header">
        <div className="col-title">
          <span className="dot" style={{ backgroundColor: color }} />
          <h3>{title}</h3>
          <span className="count">{filtered.length}</span>
        </div>
        <button className="add-btn" onClick={onAdd} title={`Add task to ${title}`}>+</button>
      </div>

      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list"
          >
            {filtered.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={task._id.toString()}
                index={index}
              >
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
      <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 8px", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
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
        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(task.assignee || task.title)}`}
        className="card-avatar"
        alt="avatar"
      />
    </div>
  </div>
);

export default Board;

