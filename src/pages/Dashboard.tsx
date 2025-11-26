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
  const [filterCategory, setFilterCategory] = useState<'all' | 'Trabajo' | 'Personal' | 'Compras'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

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

  // Derived data with filters applied
  const filteredTasks = tasks.filter((task) => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (!showCompleted && task.completed) return false;
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Stats based on all tasks (not filtered)
  const allActiveTasks = tasks.filter(t => !t.completed);
  const allCompletedTasks = tasks.filter(t => t.completed);
  const totalTasks = tasks.length;
  const totalActive = allActiveTasks.length;
  const totalCompleted = allCompletedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const completedToday = allCompletedTasks.filter(
    (t) => t.createdAt >= startOfToday.getTime()
  ).length;

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

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (targetTaskId: string) => {
    if (!currentUser || !draggingTaskId || draggingTaskId === targetTaskId) return;

    const sourceTask = tasks.find(t => t.id === draggingTaskId);
    const targetTask = tasks.find(t => t.id === targetTaskId);
    if (!sourceTask || !targetTask) return;

    // Only allow reordering within the same priority and active tasks
    if (sourceTask.priority !== targetTask.priority || sourceTask.completed || targetTask.completed) {
      return;
    }

    const updated = [...tasks];
    const fromIndex = updated.findIndex(t => t.id === draggingTaskId);
    const toIndex = updated.findIndex(t => t.id === targetTaskId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTasks(updated);
    saveTasks(currentUser.id, updated);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  return (
    <>
      <a href="#dashboard-main" className="ff-skip-link">
        Saltar al contenido principal
      </a>
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
        <main id="dashboard-main" className="ff-dashboard-main ff-dashboard-layout">
          <aside className="ff-dashboard-sidebar" aria-label="Filtros y estadísticas rápidas">
            <section className="ff-dashboard-progress" aria-label="Progreso general">
              <h2 className="ff-dashboard-section-title ff-dashboard-section-title-sm">
                Progreso general
              </h2>
              <div className="ff-dashboard-progress-bar-wrapper">
                <div className="ff-dashboard-progress-bar-track">
                  <div
                    className="ff-dashboard-progress-bar-fill"
                    style={{ width: `${completionRate}%` }}
                    aria-valuenow={completionRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  />
                </div>
                <p className="ff-dashboard-progress-label">
                  {completionRate}% completado
                </p>
              </div>
            </section>

            <section className="ff-dashboard-stats" aria-label="Estadísticas de tareas">
              <div className="ff-dashboard-stats-grid">
                <div className="ff-dashboard-stat-card">
                  <div className="ff-dashboard-stat-label">Tareas activas</div>
                  <div className="ff-dashboard-stat-value">{totalActive}</div>
                </div>
                <div className="ff-dashboard-stat-card">
                  <div className="ff-dashboard-stat-label">Completadas hoy</div>
                  <div className="ff-dashboard-stat-value">{completedToday}</div>
                </div>
                <div className="ff-dashboard-stat-card">
                  <div className="ff-dashboard-stat-label">Total tareas</div>
                  <div className="ff-dashboard-stat-value">{totalTasks}</div>
                </div>
              </div>
            </section>

            <section className="ff-dashboard-filters" aria-label="Filtros rápidos">
              <h2 className="ff-dashboard-section-title ff-dashboard-section-title-sm">
                Filtros
              </h2>
              <div className="ff-dashboard-filter-group">
                <label className="ff-dashboard-filter-label">Categoría</label>
                <div className="ff-dashboard-filter-chips">
                  {(['all', 'Trabajo', 'Personal', 'Compras'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`ff-dashboard-filter-chip ${
                        filterCategory === cat ? 'ff-dashboard-filter-chip--active' : ''
                      }`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat === 'all' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ff-dashboard-filter-group">
                <label htmlFor="task-search" className="ff-dashboard-filter-label">
                  Buscar
                </label>
                <input
                  id="task-search"
                  type="search"
                  className="ff-dashboard-search-input"
                  placeholder="Buscar por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="ff-dashboard-filter-group ff-dashboard-filter-toggle">
                <label className="ff-dashboard-filter-label-inline">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                  />
                  <span>Mostrar tareas completadas</span>
                </label>
              </div>
            </section>
          </aside>

          <section className="ff-dashboard-content" aria-label="Listado de tareas por prioridad">
            {(['high', 'mid', 'low'] as Priority[]).map(priority => (
              <section key={priority} className="ff-dashboard-section">
                <h2 className="ff-dashboard-section-title">
                  Prioridad {priorityLabels[priority]} ({tasksByPriority[priority].length})
                </h2>
                <div className="ff-dashboard-tasks ff-dashboard-tasks-grid">
                  {tasksByPriority[priority].length === 0 ? (
                    <Card className="ff-dashboard-empty-card">
                      <p className="ff-dashboard-empty">
                        No hay tareas con esta prioridad. ¡Crea una nueva para empezar!
                      </p>
                    </Card>
                  ) : (
                    tasksByPriority[priority].map(task => (
                      <Card
                        key={task.id}
                        className={`ff-task-card ff-task-card--${task.priority} ${
                          draggingTaskId === task.id ? 'ff-task-card--dragging' : ''
                        }`}
                        data-task-id={task.id}
                        tabIndex={0}
                        draggable={!task.completed}
                        onDragStart={() => handleDragStart(task.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="ff-task-card-content">
                          <div className="ff-task-card-left">
                            <div className="ff-task-card-main">
                              <Checkbox
                                id={`task-${task.id}`}
                                label={task.title}
                                checked={task.completed}
                                onChange={() => handleTaskToggle(task.id)}
                              />
                              <CategoryTag category={task.category} />
                            </div>
                            <div className="ff-task-card-meta">
                              <span className="ff-task-card-date">
                                Creada el{' '}
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                              {task.subtasks.length > 0 && (
                                <span className="ff-task-card-subtasks">
                                  {task.subtasks.length} subtarea
                                  {task.subtasks.length > 1 ? 's' : ''}
                                </span>
                              )}
                              {task.reminder && (
                                <span
                                  className="ff-task-card-reminder"
                                  aria-label="Tarea con recordatorio"
                                >
                                  ⏰
                                </span>
                              )}
                            </div>
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
                    ))
                  )}
                </div>
              </section>
            ))}

            {showCompleted && (
              <section className="ff-dashboard-section ff-dashboard-section-completed">
                <h2 className="ff-dashboard-section-title">
                  Tareas Finalizadas ({completedTasks.length})
                </h2>
                <div className="ff-dashboard-tasks ff-dashboard-tasks-grid">
                  {completedTasks.length === 0 ? (
                    <Card className="ff-dashboard-empty-card">
                      <p className="ff-dashboard-empty">
                        Aún no has completado tareas hoy. ¡Marca una tarea como completada para ver tu progreso!
                      </p>
                    </Card>
                  ) : (
                    completedTasks.map(task => (
                      <Card
                        key={task.id}
                        className="ff-task-card ff-task-card-completed ff-task-card--completed"
                        data-task-id={task.id}
                        tabIndex={0}
                      >
                        <div className="ff-task-card-content">
                          <div className="ff-task-card-left">
                            <div className="ff-task-card-main">
                              <Checkbox
                                id={`task-${task.id}`}
                                label={task.title}
                                checked={task.completed}
                                onChange={() => handleTaskToggle(task.id)}
                              />
                              <CategoryTag category={task.category} />
                            </div>
                            <div className="ff-task-card-meta">
                              <span className="ff-task-card-date">
                                Creada el{' '}
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                              {task.subtasks.length > 0 && (
                                <span className="ff-task-card-subtasks">
                                  {task.subtasks.length} subtarea
                                  {task.subtasks.length > 1 ? 's' : ''}
                                </span>
                              )}
                              {task.reminder && (
                                <span
                                  className="ff-task-card-reminder"
                                  aria-label="Tarea con recordatorio"
                                >
                                  ⏰
                                </span>
                              )}
                            </div>
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
                    ))
                  )}
                </div>
              </section>
            )}
          </section>
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

