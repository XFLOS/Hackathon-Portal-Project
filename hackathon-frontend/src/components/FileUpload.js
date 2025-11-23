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

    try {
      setUploading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      if (teamId) formData.append('teamId', teamId);
      if (userId) formData.append('userId', userId);

      // Upload to backend Cloudinary endpoint
      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('✅ File uploaded successfully!');
      console.log('Upload response:', response.data);
    } catch (err) {
      console.error("File upload failed:", err);
      alert(err.response?.data?.error || "Upload failed. Check console for details.");
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