import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="center" style={{ minHeight: '50vh', textAlign: 'center' }}>
      <div>
        <h1>404 – Page Not Found</h1>
        <p>The page you’re looking for doesn’t exist.</p>
        <Link className="btn btn-primary" to="/">Go Home</Link>
      </div>
    </section>
  );
}

