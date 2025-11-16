import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import "./FullSchedulePage.css";

const mockSchedule = [
    { slot: 1, time: "9:00 AM", teamName: "The Coders", status: "Scheduled" },
    { slot: 2, time: "9:30 AM", teamName: "White Hats", status: "Scheduled" },
    { slot: 3, time: "10:00 AM", teamName: "A Tech on Titans", status: "Scheduled" },
    { slot: 4, time: "10:30 AM", teamName: "Code+", status: "Scheduled" },
    { slot: 5, time: "11:00 AM", teamName: "The testers", status: "Scheduled" },
];

const COORDINATOR_EMAIL = "coordinator@example.com";

export default function FullSchedulePage() {
    const [schedule, setSchedule] = useState(mockSchedule);
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (user && user.email === COORDINATOR_EMAIL) setIsCoordinator(true);
        setLoading(false);
    }, []);

    const handleNoShow = (slotId) => {
        const newSchedule = schedule.map(item =>
            item.slot === slotId ? { ...item, status: item.status === 'No Show' ? 'Scheduled' : 'No Show' } : item
        );
        setSchedule(newSchedule);
        alert(`Status for Slot ${slotId} changed.`);
    };

    const handleSwap = (index1, index2) => {
        if (index1 < 0 || index2 < 0 || index1 >= schedule.length || index2 >= schedule.length) return;
        const newSchedule = [...schedule];
        [newSchedule[index1], newSchedule[index2]] = [newSchedule[index2], newSchedule[index1]];
        newSchedule[index1].slot = index1 + 1;
        newSchedule[index2].slot = index2 + 1;
        setSchedule(newSchedule);
    };

    if (loading) return <div className="schedule-loading">Loading Presentation Schedule...</div>;

    return (
        <div className="schedule-container">
            <h1 className="schedule-title">Day 2 Presentation Schedule</h1>
            <p className="schedule-subtitle">Final presentations will be held on Nov 24 at Mirvish.</p>

            {isCoordinator && (
                <div className="coordinator-controls">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`coord-button ${editMode ? 'active' : ''}`}
                    >
                        {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode (Coordinator)'}
                    </button>
                    {editMode && <p className="edit-tip">Drag and drop rows to adjust presentation order.</p>}
                </div>
            )}

            <div className="schedule-wrapper">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Slot</th>
                            <th>Time</th>
                            <th>Team Name</th>
                            <th>Status</th>
                            {isCoordinator && editMode && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((item, index) => (
                            <tr
                                key={item.slot}
                                className={`status-${item.status.toLowerCase().replace(' ', '-')}`}
                                draggable={isCoordinator && editMode}
                                onDragStart={(e) => e.dataTransfer.setData("index", index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const draggedIndex = parseInt(e.dataTransfer.getData("index"));
                                    handleSwap(draggedIndex, index);
                                }}
                            >
                                <td className="schedule-slot">{index + 1}</td>
                                <td className="schedule-time">{item.time}</td>
                                <td>{item.teamName}</td>
                                <td className="schedule-status">{item.status}</td>
                                {isCoordinator && editMode && (
                                    <td className="schedule-actions">
                                        <button
                                            onClick={() => handleNoShow(item.slot)}
                                            className="action-noshow"
                                        >
                                            {item.status === 'No Show' ? 'Mark Scheduled' : 'Mark No Show'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="schedule-footer">
                Please arrive 15 minutes before your scheduled slot. Check the portal for final updates.
            </p>
        </div>
    );
}