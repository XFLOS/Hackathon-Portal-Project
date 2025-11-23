import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './StudentChatPage.css';

export default function StudentChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const refreshInterval = useRef(null);

  // Fetch conversations list (mentors)
  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.error || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with specific mentor
  const fetchMessages = async (mentorId) => {
    try {
      const response = await api.get(`/messages/conversation/${mentorId}`);
      setMessages(response.data.messages || []);
      
      // Mark messages as read
      const unreadMessages = response.data.messages.filter(
        msg => !msg.is_read && msg.receiver_id === parseInt(localStorage.getItem('userId'))
      );
      
      for (const msg of unreadMessages) {
        await api.patch(`/messages/${msg.id}/read`);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.error || 'Failed to load messages');
    }
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedMentor) return;

    try {
      setSending(true);
      await api.post('/messages/send', {
        receiverId: selectedMentor.id,
        teamId: selectedMentor.team_id,
        message: newMessage.trim()
      });

      setNewMessage('');
      await fetchMessages(selectedMentor.id);
      await fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Select a mentor to chat with
  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    fetchMessages(mentor.id);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-refresh messages when a mentor is selected
  useEffect(() => {
    if (selectedMentor) {
      refreshInterval.current = setInterval(() => {
        fetchMessages(selectedMentor.id);
      }, 5000);

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [selectedMentor]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentUserId = parseInt(localStorage.getItem('userId'));

  if (loading) {
    return (
      <AppShell>
        <div className="student-chat-page">
          <div className="chat-loading">Loading conversations...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="student-chat-page">
        <div className="chat-container">
          {/* Sidebar - Mentors List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h2>💬 Messages</h2>
              <p className="subtitle">Chat with your mentors</p>
            </div>

            {error && conversations.length === 0 && (
              <div className="chat-error">{error}</div>
            )}

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No mentors assigned yet</p>
                  <span className="info-text">Your team mentors will appear here once assigned</span>
                </div>
              ) : (
                conversations.map((mentor) => (
                  <div
                    key={mentor.id}
                    className={`conversation-item ${selectedMentor?.id === mentor.id ? 'active' : ''}`}
                    onClick={() => handleSelectMentor(mentor)}
                  >
                    <div className="conversation-avatar">
                      {mentor.profile_image ? (
                        <img src={mentor.profile_image} alt={mentor.full_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {mentor.full_name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      )}
                      <span className="mentor-badge">🎓</span>
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{mentor.full_name || mentor.email}</span>
                        {mentor.unread_count > 0 && (
                          <span className="unread-badge">{mentor.unread_count}</span>
                        )}
                      </div>
                      <div className="conversation-role">Mentor · {mentor.team_name}</div>
                      {mentor.last_message && (
                        <div className="conversation-preview">
                          {mentor.last_message.substring(0, 40)}
                          {mentor.last_message.length > 40 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    {mentor.last_message_time && (
                      <div className="conversation-time">
                        {formatTime(mentor.last_message_time)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-main">
            {selectedMentor ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-user">
                    <div className="chat-avatar">
                      {selectedMentor.profile_image ? (
                        <img src={selectedMentor.profile_image} alt={selectedMentor.full_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedMentor.full_name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      )}
                    </div>
                    <div className="chat-header-info">
                      <h3>{selectedMentor.full_name || selectedMentor.email}</h3>
                      <span className="mentor-role-badge">🎓 Mentor · {selectedMentor.team_name}</span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet</p>
                      <span>Start the conversation with your mentor!</span>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <div className="message-text">{msg.message}</div>
                          <div className="message-time">
                            {new Date(msg.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? '📤' : '🚀'} Send
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <div className="empty-state">
                  <span className="empty-icon">💬</span>
                  <h3>Select a mentor</h3>
                  <p>Choose a mentor from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
