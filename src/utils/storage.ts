import { Task, Stats } from '../types';

// Get storage keys scoped by user ID
const getTasksKey = (userId: string) => `ff.data.${userId}.tasks`;
const getStatsKey = (userId: string) => `ff.data.${userId}.stats`;

// Legacy keys for migration
const LEGACY_TASKS_KEY = 'focusflow_tasks';
const LEGACY_STATS_KEY = 'focusflow_stats';

export const getTasks = (userId: string): Task[] => {
  const key = getTasksKey(userId);
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    // Check for legacy data and migrate if exists
    const legacyStored = localStorage.getItem(LEGACY_TASKS_KEY);
    if (legacyStored) {
      try {
        const legacyTasks = JSON.parse(legacyStored);
        saveTasks(userId, legacyTasks);
        localStorage.removeItem(LEGACY_TASKS_KEY);
        return legacyTasks;
      } catch {
        // If migration fails, return empty array
      }
    }
    
    // New users start with empty task list
    return [];
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveTasks = (userId: string, tasks: Task[]): void => {
  const key = getTasksKey(userId);
  localStorage.setItem(key, JSON.stringify(tasks));
};

export const getStats = (userId: string): Stats => {
  const key = getStatsKey(userId);
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    // Check for legacy data and migrate if exists
    const legacyStored = localStorage.getItem(LEGACY_STATS_KEY);
    if (legacyStored) {
      try {
        const legacyStats = JSON.parse(legacyStored);
        saveStats(userId, legacyStats);
        localStorage.removeItem(LEGACY_STATS_KEY);
        return legacyStats;
      } catch {
        // If migration fails, continue with default
      }
    }
    
    const defaultStats: Stats = {
      completedCount: 0,
      streakDays: 0,
      focusSessions: 0,
    };
    saveStats(userId, defaultStats);
    return defaultStats;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return {
      completedCount: 0,
      streakDays: 0,
      focusSessions: 0,
    };
  }
};

export const saveStats = (userId: string, stats: Stats): void => {
  const key = getStatsKey(userId);
  localStorage.setItem(key, JSON.stringify(stats));
};

