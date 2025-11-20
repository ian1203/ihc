export type Priority = 'low' | 'mid' | 'high';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: 'Trabajo' | 'Personal' | 'Compras';
  priority: Priority;
  completed: boolean;
  subtasks: Subtask[];
  reminder: boolean;
  reminderTime?: number; // timestamp in milliseconds
  createdAt: number;
}

export interface Stats {
  completedCount: number;
  streakDays: number;
  focusSessions: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string;
  createdAt: string;
}

export class EmailInUseError extends Error {
  constructor() {
    super('Este correo ya está en uso');
    this.name = 'EmailInUseError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos');
    this.name = 'InvalidCredentialsError';
  }
}
