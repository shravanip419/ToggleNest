import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectForm from "./ProjectForm"; //
import "./Projects.css";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const { data } = await api.get("/projects"); //
            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    useEffect(() => {
    fetchProjects();
    }, []);

    const handleAddProject = async (name) => {
        try {
            // Sending data to backend
            const response = await api.post("/projects", { name }); 
            
            // 🔥 HERE IS YOUR CONSOLE LOG
            console.log("Backend Response:", response.data); 
            
            setProjects((prev) => [...prev, response.data]);
            setShowForm(false);
        } catch (err) {
            console.error("Error details:", err.response?.data || err.message);
        }
    };
    return (
        <div className="projects-container">
            <header className="projects-header">
            <div className="header-left">
                <h1>Projects</h1> {/* Matches video title */}
                <p>Manage your projects</p>
            </div>
            <div className="header-right">
                <div className="search-bar">
                <span>🔍</span>
                <input type="text" placeholder="Search..." />
                </div>
                <button className="add-project-btn" onClick={() => setShowForm(true)}>+</button>
            </div>
            </header>

            {showForm && (
            <div className="form-overlay">
                <div className="form-modal">
                <h3>Create New Project</h3>
                <ProjectForm onSave={handleAddProject} onCancel={() => setShowForm(false)} />
                </div>
            </div>
            )}

            <section className="projects-section">
            <h2>All Projects</h2>
            <div className="projects-grid">
                {projects.map((project, index) => (
                <div
                    key={project._id}
                    className={`project-card ${["purple", "green", "orange"][index % 3]}`}
                    onClick={() => navigate(`/board/${project._id}`)} // Updated route logic
                >
                    <div className="card-top">
                    <div className="project-icon">
                        {project.name.toLowerCase().includes("web") ? "🌐" : "📱"}
                    </div>
                    <button className="options-btn" onClick={(e) => e.stopPropagation()}>•••</button>
                    </div>
                    <div className="card-content">
                    <h3>{project.name}</h3>
                    <p>Complete overhaul of the company website</p>
                    </div>
                    <div className="card-footer">
                    <div className="progress-info">
                        <span>Progress</span>
                        <span>{project.completedTasks || 0}/{project.totalTasks || 0} tasks</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div 
                        className="progress-bar-fill" 
                        style={{ width: `${(project.completedTasks/project.totalTasks)*100 || 0}%` }}
                        ></div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </section>
        </div>
        );
    };

export default Projects;