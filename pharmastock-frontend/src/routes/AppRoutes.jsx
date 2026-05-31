// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

// Pages publiques
import LoginPage from '../pages/auth/LoginPage';

// Pages privées
import DashboardPage      from '../pages/dashboard/DashboardPage';
import MedicamentsPage    from '../pages/medicaments/MedicamentsPage';
import MedicamentDetail   from '../pages/medicaments/MedicamentDetail';
import StockPage          from '../pages/stock/StockPage';
import VentesPage         from '../pages/ventes/VentesPage';
import NouvelleVentePage  from '../pages/ventes/NouvelleVentePage';
import CommandesPage      from '../pages/commandes/CommandesPage';
import AlertesPage        from '../pages/alertes/AlertesPage';
import RapportsPage       from '../pages/rapports/RapportsPage';
import UtilisateursPage   from '../pages/utilisateurs/UtilisateursPage';
import InventairePage     from '../pages/inventaire/InventairePage';
import FournisseursPage   from '../pages/fournisseurs/FournisseursPage';
import OrdonnancesPage    from '../pages/ordonnances/OrdonnancesPage';
import AuditPage          from '../pages/audit/AuditPage';

// Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
};
const PharmacienRoute = ({ children }) => {
  const { isPharmacien } = useAuth();
  return isPharmacien ? children : <Navigate to="/" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="medicaments"   element={<MedicamentsPage />} />
        <Route path="medicaments/:id" element={<MedicamentDetail />} />
        <Route path="stock"         element={<StockPage />} />
        <Route path="ventes"        element={<VentesPage />} />
        <Route path="ventes/new"    element={<NouvelleVentePage />} />
        <Route path="commandes"     element={<CommandesPage />} />
        <Route path="inventaire"    element={<InventairePage />} />
        <Route path="alertes"       element={<AlertesPage />} />
        <Route path="fournisseurs"  element={<FournisseursPage />} />
        <Route path="ordonnances"   element={<OrdonnancesPage />} />
        <Route path="rapports"      element={<PharmacienRoute><RapportsPage /></PharmacienRoute>} />
        <Route path="audit"         element={<PharmacienRoute><AuditPage /></PharmacienRoute>} />
        <Route path="utilisateurs"  element={<AdminRoute><UtilisateursPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
