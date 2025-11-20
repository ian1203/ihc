import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { InvalidCredentialsError } from '../types';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Focus email input on mount
    emailInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!email.includes('@')) {
      newErrors.email = 'El correo debe incluir @';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      // Focus first error field
      if (errors.email) emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email, password });
      const next = searchParams.get('next') || '/dashboard';
      navigate(next);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        setErrors({ general: error.message });
        emailInputRef.current?.focus();
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Ocurrió un error. Por favor, intenta de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ff-login">
      <div className="ff-login-container">
        <header className="ff-login-header">
          <h1>Iniciar sesión</h1>
          <p className="ff-login-subtitle">
            Accede a tu cuenta de FocusFlow
          </p>
        </header>

        <form onSubmit={handleSubmit} className="ff-login-form" noValidate>
          {errors.general && (
            <div role="alert" aria-live="polite" className="ff-login-errors">
              <p className="ff-login-error-message">{errors.general}</p>
            </div>
          )}

          <Input
            id="login-email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email || errors.general) {
                setErrors({});
              }
            }}
            error={errors.email}
            required
            ref={emailInputRef}
            autoComplete="email"
            autoFocus
          />

          <Input
            id="login-password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.general) {
                setErrors({});
              }
            }}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="ff-login-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="ff-login-submit"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </div>

          <p className="ff-login-signup-link">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="ff-login-link">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

