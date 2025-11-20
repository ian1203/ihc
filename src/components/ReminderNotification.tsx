import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTasks } from '../utils/storage';
import { Task } from '../types';
import './ReminderNotification.css';

export const ReminderNotification: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeReminder, setActiveReminder] = useState<Task | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setActiveReminder(null);
      setIsVisible(false);
      return;
    }

    const checkReminders = () => {
      const tasks = getTasks(currentUser.id);
      const now = Date.now();

      // Find tasks with active reminders
      const activeReminders = tasks.filter(
        task => 
          task.reminder && 
          !task.completed &&
          task.reminderTime && 
          task.reminderTime <= now &&
          task.reminderTime > now - 60000 // Show for 1 minute after trigger
      );

      if (activeReminders.length > 0) {
        // Show the first active reminder
        setActiveReminder(activeReminders[0]);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check immediately
    checkReminders();

    // Check every 10 seconds
    const interval = setInterval(checkReminders, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleDismiss = () => {
    setIsVisible(false);
    setActiveReminder(null);
  };

  if (!isVisible || !activeReminder) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="ff-reminder-notification"
    >
      <div className="ff-reminder-notification-content">
        <div className="ff-reminder-notification-header">
          <h3 className="ff-reminder-notification-title">Recordatorio</h3>
          <button
            className="ff-reminder-notification-close"
            onClick={handleDismiss}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
        <p className="ff-reminder-notification-message">
          {activeReminder.title}
        </p>
      </div>
    </div>
  );
};

