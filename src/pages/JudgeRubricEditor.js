import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config"; 
import "./JudgeRubricEditor.css";

const newCriterionTemplate = { id: Date.now(), name: "", weight: 10 };
const COORDINATOR_EMAIL = "coordinator@example.com";

export default function JudgeRubricEditor() {
    const navigate = useNavigate();
    const [rubricTitle, setRubricTitle] = useState("Default Hackathon Rubric");
    const [criteria, setCriteria] = useState([
        { id: 1, name: "Innovation & Creativity", weight: 30 },
        { id: 2, name: "Technical Implementation", weight: 40 },
        { id: 3, name: "Presentation & UX", weight: 30 },
    ]);
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (user && user.email === COORDINATOR_EMAIL) {
            setIsCoordinator(true);
        } else {
            navigate("/login"); 
        }
    }, [navigate]);

    const addCriterion = () => {
        setCriteria([...criteria, { ...newCriterionTemplate, id: Date.now() }]);
    };

    const removeCriterion = (id) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const handleCriterionChange = (id, field, value) => {
        setCriteria(criteria.map(c => 
            c.id === id ? { ...c, [field]: field === 'weight' ? parseInt(value) || 0 : value } : c
        ));
    };

    const calculateTotalWeight = () => criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

    const handleSaveRubric = async (e) => {
        e.preventDefault();
        setMessage("");
        const totalWeight = calculateTotalWeight();

        if (criteria.some(c => !c.name.trim() || c.weight <= 0)) {
            setMessage("Error: All criteria must have a name and a positive weight.");
            return;
        }
        if (totalWeight !== 100) {
            setMessage(`Warning: Total weight must equal 100. Current total: ${totalWeight}`);
            return;
        }

        setIsLoading(true);
        console.log("Saving Rubric:", { rubricTitle, criteria });
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        setMessage("Success: Rubric saved and ready for judge use!");
    };

    if (!isCoordinator) {
        return <div className="rubric-editor-container denied">Loading access...</div>;
    }

    const totalWeight = calculateTotalWeight();

    return (
        <div className="rubric-editor-container">
            <h2 className="editor-title">Custom Rubric Editor</h2>
            <p className="editor-subtitle">Administrators customize the grading criteria here.</p>

            {message && <p className={`editor-message ${message.startsWith('Error') ? 'error-message' : 'success-message'}`}>{message}</p>}

            <form onSubmit={handleSaveRubric} className="rubric-form">
                <div className="form-group">
                    <label htmlFor="rubricTitle">Rubric Name</label>
                    <input
                        id="rubricTitle"
                        type="text"
                        value={rubricTitle}
                        onChange={(e) => setRubricTitle(e.target.value)}
                        className="editor-input"
                        required
                    />
                </div>

                <h3 className="criteria-header">Grading Criteria (Total Weight: {totalWeight}%)</h3>
                
                {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="criterion-row">
                        <div className="criterion-group name-input">
                            <label>Criterion {index + 1} Name</label>
                            <input
                                type="text"
                                value={criterion.name}
                                onChange={(e) => handleCriterionChange(criterion.id, 'name', e.target.value)}
                                placeholder="e.g., Code Quality"
                                className="editor-input"
                                required
                            />
                        </div>
                        <div className="criterion-group weight-input">
                            <label>Weight (%)</label>
                            <input
                                type="number"
                                value={criterion.weight}
                                min="1"
                                onChange={(e) => handleCriterionChange(criterion.id, 'weight', e.target.value)}
                                className="editor-input weight"
                                required
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => removeCriterion(criterion.id)} 
                            className="remove-button"
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <div className="action-buttons">
                    <button type="button" onClick={addCriterion} className="add-button">
                        + Add New Criterion
                    </button>
                    <button type="submit" className="save-button" disabled={isLoading || totalWeight !== 100}>
                        {isLoading ? 'Saving...' : 'Save Rubric'}
                    </button>
                </div>
                {totalWeight !== 100 && (
                    <p className="weight-warning">
                        **Total weight must be exactly 100%. Please adjust criteria.**
                    </p>
                )}
            </form>
        </div>
    );
}