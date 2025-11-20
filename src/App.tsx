import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth/AuthContext';
import { Welcome } from './pages/Welcome';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TaskDetail } from './pages/TaskDetail';
import { FocusSession } from './pages/FocusSession';
import { Profile } from './pages/Profile';
import { ReminderNotification } from './components/ReminderNotification';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ReminderNotification />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/task/:id"
            element={
              <RequireAuth>
                <TaskDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/focus/:id"
            element={
              <RequireAuth>
                <FocusSession />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

