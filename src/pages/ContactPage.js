import React from 'react';
import './ContactPage.css';

export default function ContactPage() {
  return (
    <div className="contact-container">
      <h1 className="contact-title">Need Support?</h1>
      <p className="contact-subtitle">
        Get in touch with the Hackathon Team or your campus support.
      </p>

      <div className="contact-grid">
        <div className="contact-card">
          <h2 className="card-title">Event & Tech Support</h2>
          <p>Questions about the hackathon or technical issues.</p>
          <div className="contact-info">
            <strong>Email:</strong> 
            <a href="mailto:hackathon.support@gus-edu.com">hackathon.support@gus-edu.com</a>
          </div>
          <div className="contact-info">
            <strong>Live Chat:</strong> From 9am - 5pm (Weekdays)
          </div>
        </div>

        <div className="contact-card">
          <h2 className="card-title">Niagara College - Toronto</h2>
          <p>Student services, campus access, and general support.</p>
          <div className="contact-info">
            <strong>Phone:</strong> 
            <a href="tel:+14168001710">(416) 800-1710</a>
          </div>
          <div className="contact-info">
            <strong>Website:</strong> 
            <a href="https://niagaracollege.ca/toronto/" target="_blank" rel="noopener noreferrer">
              niagaracollege.ca/toronto
            </a>
          </div>
          <div className="contact-info">
            <strong>Location:</strong> 295 Adelaide St W, Toronto, ON M5V 1P7
          </div>
        </div>
      </div>
    </div>
  );
}