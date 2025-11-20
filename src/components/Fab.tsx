import React from 'react';
import './Fab.css';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: React.ReactNode;
}

export const Fab: React.FC<FabProps> = ({ className = '', ...props }) => {
  return (
    <button
      className={`ff-fab ${className}`}
      {...props}
    />
  );
};

