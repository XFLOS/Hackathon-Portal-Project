import React from 'react';

export default function HelpPage() {
  return (
    <div>
      <h2>Help</h2>
      <p>Welcome to the Hackathon Portal! This page includes FAQs, rules, and support links.</p>
      <h3>FAQs</h3>
      <ul>
        <li><strong>How do I register?</strong> Use the Register page and pick your role (student, mentor, judge).</li>
        <li><strong>How do I join a team?</strong> After registering, go to Team Selection to create or join a team.</li>
        <li><strong>Who can create admin accounts?</strong> Admins must be created manually using backend scripts; registration cannot create admin accounts.</li>
      </ul>
      <h3>Support</h3>
      <p>If you need help, contact the organizing team at <a href="mailto:help@hackathon.org">help@hackathon.org</a>.</p>
    </div>
  );
}

