import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import TransformerListingPage from './pages/TransformerListingPage';
import TransformerDetailsPage from './pages/TransformerDetailsPage';
import MapPage from './pages/MapPage';
import CreateUserPage from './pages/CreateUserPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<TransformerListingPage />} />
              <Route path="/transformers/:id" element={<TransformerDetailsPage />} />
              <Route path="/map" element={<MapPage />} />
            </Route>

            {/* Admin Only Route */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/create-user" element={<CreateUserPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
