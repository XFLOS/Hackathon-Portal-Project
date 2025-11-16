import React, { useState } from 'react';
import api from '../services/api';

export default function SubmissionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/projects', { title, description });
      setMessage('Submitted: ' + res.data?.project?.title);
      setTitle('');
      setDescription('');
    } catch (err) {
      setMessage('Submit failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Submission</h2>
      <form onSubmit={submit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">Submit Project</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

