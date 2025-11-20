import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Task, Subtask, Priority } from '../types';
import { getTasks, saveTasks } from '../utils/storage';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import { PriorityPills } from '../components/PriorityPills';
import { Card } from '../components/Card';
import './TaskDetail.css';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const tasks = getTasks(currentUser.id);
    const found = tasks.find(t => t.id === id);
    if (found) {
      setTask(found);
      // Set reminder time input if reminder is active
      if (found.reminder && found.reminderTime) {
        const date = new Date(found.reminderTime);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setReminderTime(`${hours}:${minutes}`);
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate, currentUser]);

  const updateTask = (updates: Partial<Task>) => {
    if (!task || !currentUser) return;
    const updated = { ...task, ...updates };
    setTask(updated);
    const tasks = getTasks(currentUser.id);
    const updatedTasks = tasks.map(t => t.id === task.id ? updated : t);
    saveTasks(currentUser.id, updatedTasks);
  };

  const handleReminderToggle = (checked: boolean) => {
    if (!task) return;
    
    let reminderTimeValue: number | undefined;
    if (checked && reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const now = new Date();
      const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      if (reminderDate <= now) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
      reminderTimeValue = reminderDate.getTime();
    }
    
    updateTask({ 
      reminder: checked,
      reminderTime: reminderTimeValue,
    });
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    if (!task || !time) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    updateTask({ reminderTime: reminderDate.getTime() });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim() || !task) return;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: newSubtaskText.trim(),
      completed: false,
    };

    updateTask({
      subtasks: [...task.subtasks, newSubtask],
    });
    setNewSubtaskText('');
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!task) return;
    const updated = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask({ subtasks: updated });
  };

  if (!task) return null;

  return (
    <main className="ff-task-detail">
      <header className="ff-task-detail-header">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          ← Volver
        </Button>
      </header>
      <div className="ff-task-detail-content">
        <Card className="ff-task-detail-card">
          <Input
            label="Título de la tarea"
            value={task.title}
            onChange={(e) => updateTask({ title: e.target.value })}
            onBlur={() => {
              if (!currentUser) return;
              const tasks = getTasks(currentUser.id);
              const updatedTasks = tasks.map(t => t.id === task.id ? task : t);
              saveTasks(currentUser.id, updatedTasks);
            }}
          />
        </Card>

        <Card className="ff-task-detail-card">
          <h2 className="ff-task-detail-section-title">Subtareas</h2>
          <div className="ff-task-detail-subtasks">
            {task.subtasks.map(subtask => (
              <Checkbox
                key={subtask.id}
                id={`subtask-${subtask.id}`}
                label={subtask.text}
                checked={subtask.completed}
                onChange={() => handleSubtaskToggle(subtask.id)}
              />
            ))}
            <form onSubmit={handleAddSubtask} className="ff-task-detail-add-subtask">
              <Input
                label="Añadir subtarea"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Escribe una subtarea..."
              />
              <Button type="submit" variant="primary">
                Añadir
              </Button>
            </form>
          </div>
        </Card>

        <Card className="ff-task-detail-card">
          <h2 className="ff-task-detail-section-title">Prioridad</h2>
          <PriorityPills
            value={task.priority}
            onChange={(priority: Priority) => updateTask({ priority })}
          />
        </Card>

        <Card className="ff-task-detail-card">
          <div className="ff-task-detail-reminder">
            <Toggle
              id="reminder-toggle"
              label="Recordatorio"
              checked={task.reminder}
              onChange={(e) => handleReminderToggle(e.target.checked)}
            />
            {task.reminder && (
              <Input
                id="reminder-time"
                label="Hora del recordatorio"
                type="time"
                value={reminderTime}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                required
              />
            )}
          </div>
        </Card>

        <div className="ff-task-detail-actions">
          <Button
            variant="primary"
            onClick={() => navigate(`/focus/${task.id}`)}
            className="ff-task-detail-focus-button"
          >
            Iniciar modo Focus
          </Button>
        </div>
      </div>
    </main>
  );
};

