import "./Board.css";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "./Sidebar";
import Header from "./Header";

const initialTasks = [
  {
    _id: "1",
    title: "Design system documentation",
    status: "todo",
    priority: "high",
    dueDate: "Jan 20"
  },
  {
    _id: "2",
    title: "User authentication flow",
    status: "in-progress",
    priority: "urgent",
    dueDate: "Jan 18"
  },
  {
    _id: "3",
    title: "Analytics dashboard",
    status: "in-progress",
    priority: "high",
    dueDate: "Jan 24"
  },
  {
    _id: "4",
    title: "Homepage hero section",
    status: "done",
    priority: "high",
    dueDate: "Jan 15"
  }
];

const Board = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedTasks = tasks.map(task =>
      task._id === result.draggableId
        ? { ...task, status: result.destination.droppableId }
        : task
    );

    setTasks(updatedTasks);
  };

  return (
    <div className="activity-layout">
      <Sidebar />

      <div className="main-section">
        <Header />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board">
            <Column title="To Do" status="todo" tasks={tasks} />
            <Column title="In Progress" status="in-progress" tasks={tasks} />
            <Column title="Done" status="done" tasks={tasks} />
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

const Column = ({ title, status, tasks }) => {
  const filteredTasks = tasks.filter(task => task.status === status);

  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          className="column"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="column-header">
            <h3>{title}</h3>
          </div>

          {filteredTasks.map((task, index) => (
            <Draggable
              key={task._id}
              draggableId={task._id}
              index={index}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
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
  );
};

const Card = ({ task }) => (
  <div className="card">
    <h4>{task.title}</h4>

    <span className={`priority ${task.priority}`}>
      {task.priority}
    </span>

    <div className="card-footer">
      <span>{task.dueDate}</span>
    </div>
  </div>
);

export default Board;
