import React from 'react';
import './Toggle.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ff-toggle-wrapper ${className}`}>
      <input
        type="checkbox"
        id={toggleId}
        className="ff-toggle"
        role="switch"
        {...props}
      />
      <label htmlFor={toggleId} className="ff-toggle-label">
        {label}
      </label>
    </div>
  );
};

