import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientWorkspace from './pages/ClientWorkspace';
import DocumentReview from './pages/DocumentReview';
import TenantIsolationPage from './pages/TenantIsolationPage';
import WalkthroughPage from './pages/WalkthroughPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:clientId" element={<ClientWorkspace />} />
            <Route path="documents/:documentId/review" element={<DocumentReview />} />
            <Route path="tenant-isolation" element={<TenantIsolationPage />} />
            <Route path="walkthrough" element={<WalkthroughPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
