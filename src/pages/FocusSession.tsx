import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getTasks } from '../utils/storage';
import { getStats, saveStats } from '../utils/storage';
import { Button } from '../components/Button';
import { ProgressRing } from '../components/ProgressRing';
import './FocusSession.css';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

export const FocusSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!currentUser) return;
    const tasks = getTasks(currentUser.id);
    const task = tasks.find(t => t.id === id);
    if (!task) {
      navigate('/dashboard');
    }
  }, [id, navigate, currentUser]);

  const handleComplete = useCallback(() => {
    if (!currentUser) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const stats = getStats(currentUser.id);
    stats.focusSessions += 1;
    saveStats(currentUser.id, stats);
    navigate('/profile');
  }, [navigate, currentUser]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const startTime = Date.now() - pausedTimeRef.current;
      startTimeRef.current = startTime;

      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, FOCUS_DURATION - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleComplete();
        }
      }, 100); // Update every 100ms for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isPaused && startTimeRef.current) {
        pausedTimeRef.current = Date.now() - startTimeRef.current;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, handleComplete]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(FOCUS_DURATION);
    pausedTimeRef.current = 0;
    handleComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeRemaining / FOCUS_DURATION;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <main className="ff-focus-session">
      <div className="ff-focus-session-content">
        <ProgressRing progress={progress} size={300}>
          <div
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            className="ff-focus-timer"
          >
            <div className="ff-focus-timer-display">
              {formatTime(timeRemaining)}
            </div>
            <div className="ff-focus-timer-status" aria-label={`${minutes} minutos y ${seconds} segundos restantes`}>
              {isPaused ? 'Pausado' : isRunning ? 'En curso' : 'Listo para comenzar'}
            </div>
          </div>
        </ProgressRing>

        <div className="ff-focus-session-controls">
          {!isRunning ? (
            <Button variant="primary" onClick={handleStart} className="ff-focus-button">
              Iniciar
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button variant="primary" onClick={handleResume} className="ff-focus-button">
                  Reanudar
                </Button>
              ) : (
                <Button variant="secondary" onClick={handlePause} className="ff-focus-button">
                  Pausar
                </Button>
              )}
              <Button variant="ghost" onClick={handleStop} className="ff-focus-button">
                Detener
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

