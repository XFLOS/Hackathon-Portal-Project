// src/components/ui/Card.jsx
import React from "react";
import "./card.css";

const Card = ({ title, subtitle, actions, children, className = "" }) => {
  return (
    <section className={`ui-card ${className}`}>
      {(title || subtitle || actions) && (
        <header className="ui-card__header">
          <div>
            {title && <h2 className="ui-card__title">{title}</h2>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
};

export default Card;
