import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./MentorChatPage.css";

const mockChatHistory = [
    { type: "mentor", text: "Welcome Team Coders! I'm here to help with your AI model scaling questions.", timestamp: "10:00 AM" },
    { type: "team", text: "Thanks, Dr. Reed! We're struggling with the MongoDB schema for user profiles. Can we schedule a quick call?", timestamp: "10:15 AM" },
    { type: "mentor", text: "Sure. I'll drop a note on your private workspace (Page 6) with my next availability slots.", timestamp: "10:25 AM" },
];

export default function MentorChatPage() {
    const [messages, setMessages] = useState(mockChatHistory);
    const [newMessage, setNewMessage] = useState("");
    const [mentorName, setMentorName] = useState("Dr. Evelyn Reed");
    const [teamName, setTeamName] = useState("The Code Whisperers");
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
        }
      
        scrollToBottom();
    }, [navigate, messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;


        const newMsg = {
            type: "team", 
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
    };

    return (
        <div className="chat-page-container">
            <div className="chat-card">
                <header className="chat-header">
                    <h1 className="chat-title">Mentor Q&A: {mentorName}</h1>
                    <p className="chat-subtitle">Chat with your assigned mentor for guidance.</p>
                </header>
                
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message-bubble ${msg.type === 'team' ? 'team-msg' : 'mentor-msg'}`}
                        >
                            <span className="message-content">{msg.text}</span>
                            <span className="message-timestamp">{msg.timestamp}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef} /> 
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-form">
                    <input
                        type="text"
                        placeholder="Type your question here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="message-input"
                    />
                    <button type="submit" className="send-button">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}