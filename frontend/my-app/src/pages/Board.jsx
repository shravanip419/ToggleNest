import "./Board.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskForm from "./TaskForm"; //
import api from "../api/axios";

const Board = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formStatus, setFormStatus] = useState("todo");
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, projectRes] = await Promise.all([
          api.get(`/tasks?projectId=${projectId}`),
          api.get(`/projects`) // We find our specific project from the list
        ]);
        
        setTasks(taskRes.data);
        const currentProject = projectRes.data.find(p => p._id === projectId);
        setProject(currentProject);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // DRAG & DROP (PATCH TO BACKEND)
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic Update
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await api.patch(`/tasks/${draggableId}`, { status: newStatus }); //
    } catch (err) {
      console.error("Update failed", err);
      fetchTasks(); // Rollback on error
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      const { data } = await api.post("/tasks", { ...taskData, projectId }); //
      setTasks(prev => [...prev, data]);
      setShowForm(false);
    } catch (err) {
      console.error("Create task failed:", err);
    }
  };

  if (loading) return <div className="board-loading">Loading Board...</div>;

  return (
    <div className="board-wrapper">
      <header className="board-header">
        <div className="header-nav">
           <button onClick={() => navigate("/board")} className="back-btn">← Projects</button>
           <h1>{project?.name || "Project Board"}</h1>
        </div>
        <div className="board-meta">
          <div className="search-bar"><span>🔍</span><input type="text" placeholder="Search tasks..." /></div>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          <Column title="To Do" status="todo" color="#6366f1" tasks={tasks} onAdd={() => { setFormStatus("todo"); setShowForm(true); }} />
          <Column title="In Progress" status="in-progress" color="#7c3aed" tasks={tasks} onAdd={() => { setFormStatus("in-progress"); setShowForm(true); }} />
          <Column title="Done" status="done" color="#22c55e" tasks={tasks} onAdd={() => { setFormStatus("done"); setShowForm(true); }} />
        </div>
      </DragDropContext>

      {showForm && <TaskForm defaultStatus={formStatus} onClose={() => setShowForm(false)} onSave={handleSaveTask} />}
    </div>
  );
};

const Column = ({ title, status, color, tasks, onAdd }) => {
  const filtered = tasks.filter(t => t.status === status);
  return (
    <div className="column">
      <div className="column-header">
        <div className="col-title">
          <span className="dot" style={{ backgroundColor: color }}></span>
          <h3>{title}</h3>
          <span className="count">{filtered.length}</span>
        </div>
        <button className="add-btn" onClick={onAdd}>+</button>
      </div>
      <Droppable droppableId={status}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="task-list">
            {filtered.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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
  <div className="card">
    <div className="card-top-row">
       <h4>{task.title}</h4>
    </div>
    <span className={`priority ${task.priority}`}>{task.priority}</span>
    <div className="card-footer">
      <span className="due-date">📅 {task.dueDate || "No date"}</span>
      <img src={`https://i.pravatar.cc/150?u=${task._id}`} className="card-avatar" alt="assignee" />
    </div>
  </div>
);

export default Board;