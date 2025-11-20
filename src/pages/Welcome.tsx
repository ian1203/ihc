import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import './Welcome.css';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="ff-welcome">
      <header className="ff-welcome-header">
        <h1 className="ff-welcome-logo">FocusFlow</h1>
        <p className="ff-welcome-tagline">
          Organiza tus tareas y mantén el foco
        </p>
      </header>
      <div className="ff-welcome-actions">
        <Button
          variant="primary"
          onClick={() => navigate('/signup')}
          className="ff-welcome-primary-button"
        >
          Crear cuenta
        </Button>
        <button
          className="ff-welcome-link"
          onClick={() => navigate('/login')}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </main>
  );
};

