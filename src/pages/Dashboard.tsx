import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Task, Priority } from '../types';
import { getTasks, saveTasks } from '../utils/storage';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { PriorityPills } from '../components/PriorityPills';
import { Fab } from '../components/Fab';
import { CategoryTag } from '../components/CategoryTag';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Trabajo' | 'Personal' | 'Compras'>('Trabajo');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('mid');
  const [newTaskReminder, setNewTaskReminder] = useState(false);
  const [newTaskReminderTime, setNewTaskReminderTime] = useState('');

  useEffect(() => {
    if (currentUser) {
      setTasks(getTasks(currentUser.id));
    }
  }, [currentUser]);

  const handleTaskToggle = (taskId: string) => {
    if (!currentUser) return;
    const updated = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    saveTasks(currentUser.id, updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentUser) return;

    // Calculate reminder time if reminder is enabled
    let reminderTime: number | undefined;
    if (newTaskReminder && newTaskReminderTime) {
      const [hours, minutes] = newTaskReminderTime.split(':').map(Number);
      const now = new Date();
      const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      // If time has passed today, set for tomorrow
      if (reminderDate <= now) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
      reminderTime = reminderDate.getTime();
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      subtasks: [],
      reminder: newTaskReminder,
      reminderTime,
      createdAt: Date.now(),
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(currentUser.id, updated);
    setNewTaskTitle('');
    setNewTaskReminder(false);
    setNewTaskReminderTime('');
    setIsModalOpen(false);

    // Focus the new task card
    setTimeout(() => {
      const card = document.querySelector(`[data-task-id="${newTask.id}"]`) as HTMLElement;
      card?.focus();
    }, 100);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const tasksByPriority = {
    high: activeTasks.filter(t => t.priority === 'high'),
    mid: activeTasks.filter(t => t.priority === 'mid'),
    low: activeTasks.filter(t => t.priority === 'low'),
  };

  const priorityLabels: Record<Priority, string> = {
    high: 'Alta',
    mid: 'Media',
    low: 'Baja',
  };

  return (
    <>
      <header className="ff-app-header">
        <h1 className="ff-app-title">FocusFlow</h1>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="ff-app-logout"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </Button>
      </header>
      <div className="ff-dashboard-container">
        <div className="ff-dashboard-greeting-wrapper">
          <p className="ff-dashboard-greeting">
            {getGreeting()}, {currentUser?.name || 'Usuario'}
          </p>
        </div>
        <main className="ff-dashboard-main">
        {(['high', 'mid', 'low'] as Priority[]).map(priority => (
          <section key={priority} className="ff-dashboard-section">
            <h2 className="ff-dashboard-section-title">
              Prioridad {priorityLabels[priority]}
            </h2>
            <div className="ff-dashboard-tasks">
              {tasksByPriority[priority].map(task => (
                <Card
                  key={task.id}
                  className="ff-task-card"
                  data-task-id={task.id}
                  tabIndex={0}
                >
                  <div className="ff-task-card-content">
                    <div className="ff-task-card-left">
                      <Checkbox
                        id={`task-${task.id}`}
                        label={task.title}
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <CategoryTag category={task.category} />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/task/${task.id}`)}
                      aria-label={`Editar tarea: ${task.title}`}
                    >
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
              {tasksByPriority[priority].length === 0 && (
                <p className="ff-dashboard-empty">No hay tareas con esta prioridad</p>
              )}
            </div>
          </section>
        ))}

        {completedTasks.length > 0 && (
          <section className="ff-dashboard-section ff-dashboard-section-completed">
            <h2 className="ff-dashboard-section-title">Tareas Finalizadas</h2>
            <div className="ff-dashboard-tasks">
              {completedTasks.map(task => (
                <Card
                  key={task.id}
                  className="ff-task-card ff-task-card-completed"
                  data-task-id={task.id}
                  tabIndex={0}
                >
                  <div className="ff-task-card-content">
                    <div className="ff-task-card-left">
                      <Checkbox
                        id={`task-${task.id}`}
                        label={task.title}
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <CategoryTag category={task.category} />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/task/${task.id}`)}
                      aria-label={`Editar tarea: ${task.title}`}
                    >
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
        </main>
      </div>
      <Fab
        aria-label="Añadir tarea"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </Fab>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva tarea"
      >
        <form onSubmit={handleCreateTask} className="ff-task-form">
          <Input
            label="Título de la tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="ff-task-form-field">
            <label htmlFor="task-category" className="ff-input-label">Categoría</label>
            <select
              id="task-category"
              className="ff-input"
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as 'Trabajo' | 'Personal' | 'Compras')}
            >
              <option value="Trabajo">Trabajo</option>
              <option value="Personal">Personal</option>
              <option value="Compras">Compras</option>
            </select>
          </div>
          <div className="ff-task-form-field">
            <PriorityPills
              value={newTaskPriority}
              onChange={setNewTaskPriority}
            />
          </div>
          <div className="ff-task-form-field">
            <Checkbox
              id="new-task-reminder"
              label="Activar recordatorio"
              checked={newTaskReminder}
              onChange={(e) => setNewTaskReminder(e.target.checked)}
            />
            {newTaskReminder && (
              <Input
                id="new-task-reminder-time"
                label="Hora del recordatorio"
                type="time"
                value={newTaskReminderTime}
                onChange={(e) => setNewTaskReminderTime(e.target.value)}
                required={newTaskReminder}
              />
            )}
          </div>
          <div className="ff-task-form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Crear tarea
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

