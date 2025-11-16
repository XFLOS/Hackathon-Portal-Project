import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./TeamPage.css";

const mockWorkspaceData = {
    teamName: "The Coders",
    tasks: [
        { id: 1, name: "Finalize AI Model Training Data", assignedTo: "Cassia", status: "In Progress" },
        { id: 2, name: "Design Presentation Slides", assignedTo: "Anish", status: "To Do" },
        { id: 3, name: "Integrate Firebase Authentication", assignedTo: "Lucas", status: "Completed" },
    ],
    notes: [
        { id: 1, content: "Remember to use the Cloudinary for submissions!", author: "Cassia (Leader)" },
        { id: 2, content: "Check report.", author: "Lucas" },
    ],
    resourceLinks: [
        { name: "Official Hackathon GitHub Repo", url: "https://github.com/gus-hack-2025/team-7" },
        { name: "MongoDB Atlas website", url: "mongodb.com" },
    ],
};

export default function TeamWorkspacePage() {
    const [workspace, setWorkspace] = useState(null);
    const [newTask, setNewTask] = useState("");
    const [newNote, setNewNote] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }
        setWorkspace(mockWorkspaceData);
    }, [navigate]);

    const handleChange = (setter) => (e) => setter(e.target.value);

    const handleAddTask = (e) => {
        e.preventDefault();
        const trimmedTask = newTask.trim();
        if (!trimmedTask) return;

        if (workspace.tasks.some(t => t.name === trimmedTask)) {
            alert("Task already exists!");
            return;
        }

        const task = {
            id: workspace.tasks.length + 1,
            name: trimmedTask,
            assignedTo: "Me",
            status: "To Do",
        };
        setWorkspace(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
        setNewTask("");
    };

    const handleAddNote = (e) => {
        e.preventDefault();
        const trimmedNote = newNote.trim();
        if (!trimmedNote) return;

        const note = {
            id: workspace.notes.length + 1,
            content: trimmedNote,
            author: "You",
        };
        setWorkspace(prev => ({ ...prev, notes: [note, ...prev.notes] }));
        setNewNote("");
    };

    const toggleTaskStatus = (taskId) => {
        setWorkspace(prev => ({
            ...prev,
            tasks: prev.tasks.map(task =>
                task.id === taskId
                    ? { ...task, status: task.status === 'Completed' ? 'To Do' : 'Completed' }
                    : task
            )
        }));
    };

    if (!workspace) return <div className="loading-container">Loading Private Workspace...</div>;

    return (
        <div className="workspace-container">
            <h1 className="workspace-title">{workspace.teamName} - Private Workspace</h1>
            <p className="workspace-subtitle">Your team's internal collaboration hub.</p>

            <section className="section task-section">
                <h3 className="section-title">Tasks List</h3>
                <form onSubmit={handleAddTask} className="task-form">
                    <input
                        type="text"
                        placeholder="Add a new task (e.g., Build Frontend Dashboard)"
                        value={newTask}
                        onChange={handleChange(setNewTask)}
                        className="task-input"
                        required
                    />
                    <button type="submit" className="task-button">Add Task</button>
                </form>
                
                <div className="task-list">
                    {workspace.tasks.map(task => (
                        <div key={task.id} className={`task-item status-${task.status.toLowerCase().replace(' ', '-')}`}>
                            <input 
                                type="checkbox" 
                                checked={task.status === 'Completed'}
                                onChange={() => toggleTaskStatus(task.id)}
                            />
                            <span className="task-name">{task.name}</span>
                            <span className="task-assignee">({task.assignedTo})</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section notes-section">
                <h3 className="section-title">Notes</h3>
                <form onSubmit={handleAddNote} className="note-form">
                    <textarea
                        placeholder="Share a quick note or idea..."
                        value={newNote}
                        onChange={handleChange(setNewNote)}
                        rows="3"
                        className="note-textarea"
                        required
                    ></textarea>
                    <button type="submit" className="task-button">Add Note</button>
                </form>

                <div className="notes-list">
                    {workspace.notes.map(note => (
                        <div key={note.id} className="note-item">
                            <p className="note-content">{note.content}</p>
                            <span className="note-author">- {note.author}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section links-section">
                <h3 className="section-title">Resources and References</h3>
                <ul className="links-list">
                    {workspace.resourceLinks.map((link, index) => (
                        <li key={index}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                                {link.name} &rarr;
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}