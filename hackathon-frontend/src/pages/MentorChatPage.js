import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import './MentorChatPage.css';

export default function MentorChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const refreshInterval = useRef(null);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.error || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with specific user
  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
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
    
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setSending(true);
      await api.post('/messages/send', {
        receiverId: selectedUser.id,
        teamId: selectedUser.team_id,
        message: newMessage.trim()
      });

      setNewMessage('');
      await fetchMessages(selectedUser.id);
      await fetchConversations(); // Refresh to update last message
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Select a user to chat with
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-refresh messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      // Refresh messages every 5 seconds
      refreshInterval.current = setInterval(() => {
        fetchMessages(selectedUser.id);
      }, 5000);

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [selectedUser]);

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
        <div className="chat-page">
          <div className="chat-loading">Loading conversations...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="chat-page">
        <div className="chat-container">
          {/* Sidebar - Conversations List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h2>💬 Messages</h2>
              <p className="subtitle">Chat with your team members</p>
            </div>

            {error && conversations.length === 0 && (
              <div className="chat-error">{error}</div>
            )}

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No students assigned yet</p>
                  <span className="info-text">Students from your assigned teams will appear here</span>
                </div>
              ) : (
                conversations.map((user) => (
                  <div
                    key={user.id}
                    className={`conversation-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="conversation-avatar">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.full_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{user.full_name || user.email}</span>
                        {user.unread_count > 0 && (
                          <span className="unread-badge">{user.unread_count}</span>
                        )}
                      </div>
                      <div className="conversation-team">{user.team_name}</div>
                      {user.last_message && (
                        <div className="conversation-preview">
                          {user.last_message.substring(0, 40)}
                          {user.last_message.length > 40 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    {user.last_message_time && (
                      <div className="conversation-time">
                        {formatTime(user.last_message_time)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-main">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-user">
                    <div className="chat-avatar">
                      {selectedUser.profile_image ? (
                        <img src={selectedUser.profile_image} alt={selectedUser.full_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedUser.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="chat-header-info">
                      <h3>{selectedUser.full_name || selectedUser.email}</h3>
                      <span className="team-badge">{selectedUser.team_name}</span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet</p>
                      <span>Start the conversation!</span>
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
                  <h3>Select a conversation</h3>
                  <p>Choose a student from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
