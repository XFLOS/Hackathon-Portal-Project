import React, { useState } from "react";
import api from '../services/api';
import { auth } from '../firebase/config';
import { getIdToken } from 'firebase/auth';
import "./FileUpload.css";

function FileUpload({ teamId, userId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in!");

    try {
      setUploading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', teamId);
      formData.append('userId', userId);

      // Use api wrapper — it will attach Firebase ID token or JWT automatically
      const response = await api.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('✅ File uploaded successfully!');
      console.log('File URL:', response.data.fileUrl);
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default FileUpload;