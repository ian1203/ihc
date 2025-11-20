import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { EmailInUseError } from '../types';
import './Signup.css';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Focus name input on mount
    nameInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!email.includes('@')) {
      newErrors.email = 'El correo debe incluir @';
    }

    if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === 'name') nameInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await signup({ name, email, password });
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof EmailInUseError) {
        setErrors({ email: error.message });
        const emailInput = document.getElementById('signup-email') as HTMLInputElement;
        emailInput?.focus();
      } else if (error instanceof Error) {
        setErrors({ password: error.message });
        const passwordInput = document.getElementById('signup-password') as HTMLInputElement;
        passwordInput?.focus();
      } else {
        setErrors({ general: 'Ocurrió un error. Por favor, intenta de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ff-signup">
      <div className="ff-signup-container">
        <header className="ff-signup-header">
          <h1>Crear cuenta</h1>
          <p className="ff-signup-subtitle">
            Únete a FocusFlow para organizar tus tareas
          </p>
        </header>

        <form onSubmit={handleSubmit} className="ff-signup-form" noValidate>
          {(errors.general || Object.keys(errors).length > 0) && (
            <div role="alert" aria-live="polite" className="ff-signup-errors">
              {errors.general && <p className="ff-signup-error-message">{errors.general}</p>}
            </div>
          )}

          <Input
            id="signup-name"
            label="Nombre"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            required
            ref={nameInputRef}
            autoComplete="name"
          />

          <Input
            id="signup-email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div className="ff-signup-password-field">
            <Input
              id="signup-password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <p className="ff-signup-password-help" aria-live="polite">
              La contraseña debe tener al menos 8 caracteres
            </p>
          </div>

          <Input
            id="signup-confirm-password"
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <div className="ff-signup-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="ff-signup-submit"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </div>

          <p className="ff-signup-login-link">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="ff-signup-link">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

