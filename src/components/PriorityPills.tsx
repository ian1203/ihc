import React from 'react';
import { Priority } from '../types';
import './PriorityPills.css';

export interface PriorityPillsProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  label?: string;
}

export const PriorityPills: React.FC<PriorityPillsProps> = ({
  value,
  onChange,
  label = 'Prioridad',
}) => {
  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Baja', color: 'var(--prio-low)' },
    { value: 'mid', label: 'Media', color: 'var(--prio-mid)' },
    { value: 'high', label: 'Alta', color: 'var(--prio-high)' },
  ];

  return (
    <div className="ff-priority-pills" role="group" aria-label={label}>
      {priorities.map((priority) => (
        <button
          key={priority.value}
          type="button"
          className={`ff-priority-pill ${value === priority.value ? 'ff-priority-pill--active' : ''}`}
          onClick={() => onChange(priority.value)}
          aria-pressed={value === priority.value}
          style={{
            '--priority-color': priority.color,
          } as React.CSSProperties}
        >
          <span
            className="ff-priority-pill-chip"
            style={{ backgroundColor: priority.color }}
            aria-hidden="true"
          />
          <span>{priority.label}</span>
        </button>
      ))}
    </div>
  );
};

