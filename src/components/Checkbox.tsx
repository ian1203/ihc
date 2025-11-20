import React from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ff-checkbox-wrapper ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className="ff-checkbox"
        {...props}
      />
      <label htmlFor={checkboxId} className="ff-checkbox-label">
        {label}
      </label>
    </div>
  );
};

