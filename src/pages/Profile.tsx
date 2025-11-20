import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getTasks } from '../utils/storage';
import { getStats, Stats } from '../utils/storage';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState<Stats>({
    completedCount: 0,
    streakDays: 0,
    focusSessions: 0,
  });
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const tasks = getTasks(currentUser.id);
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    setCompletionRate(rate);
    setStats(getStats(currentUser.id));
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="ff-profile">
      <header className="ff-profile-header">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          ← Volver
        </Button>
        <h1 className="ff-profile-title">Perfil</h1>
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="ff-profile-logout"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </Button>
      </header>
      <div className="ff-profile-content">
        <Card className="ff-profile-info">
          <h2 className="ff-profile-section-title">Información</h2>
          <div className="ff-profile-field">
            <span className="ff-profile-label">Nombre:</span>
            <span className="ff-profile-value">{currentUser?.name || 'Usuario'}</span>
          </div>
          <div className="ff-profile-field">
            <span className="ff-profile-label">Correo:</span>
            <span className="ff-profile-value">{currentUser?.email || ''}</span>
          </div>
        </Card>

        <div className="ff-profile-stats">
          <Card className="ff-profile-stat-card">
            <div className="ff-profile-stat-value">{completionRate}%</div>
            <div className="ff-profile-stat-label">Completado</div>
          </Card>

          <Card className="ff-profile-stat-card">
            <div className="ff-profile-stat-value">{stats.streakDays}</div>
            <div className="ff-profile-stat-label">Racha</div>
          </Card>

          <Card className="ff-profile-stat-card">
            <div className="ff-profile-stat-value">7</div>
            <div className="ff-profile-stat-label">Días activos</div>
          </Card>

          <Card className="ff-profile-stat-card">
            <div className="ff-profile-stat-value">{stats.focusSessions}</div>
            <div className="ff-profile-stat-label">Sesiones Focus</div>
          </Card>
        </div>

        <Card className="ff-profile-settings">
          <h2 className="ff-profile-section-title">Configuración</h2>
          <nav className="ff-profile-settings-list" aria-label="Configuración">
            <a href="#" className="ff-profile-settings-item" onClick={(e) => e.preventDefault()}>
              Notificaciones
            </a>
            <a href="#" className="ff-profile-settings-item" onClick={(e) => e.preventDefault()}>
              Privacidad
            </a>
            <a href="#" className="ff-profile-settings-item" onClick={(e) => e.preventDefault()}>
              Apariencia
            </a>
            <a href="#" className="ff-profile-settings-item" onClick={(e) => e.preventDefault()}>
              Ayuda
            </a>
          </nav>
        </Card>
      </div>
    </main>
  );
};

