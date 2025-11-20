import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="ff-input-wrapper">
      <label htmlFor={inputId} className="ff-input-label">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`ff-input ${error ? 'ff-input--error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <div id={errorId} className="ff-input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

