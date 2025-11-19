// src/components/ui/Button.jsx
import React from "react";
import "./button.css";

const Button = ({
  variant = "primary",
  size = "md",
  full = false,
  icon,
  children,
  ...rest
}) => {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    full ? "ui-btn--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {icon && <span className="ui-btn__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
