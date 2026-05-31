import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Pill, Package, ShoppingCart,
  Truck, Bell, BarChart2, Users, Archive,
  LogOut, Cross, Building2, FileText, Shield,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard',    roles: ['ALL'] },
  { label: 'Médicaments',  icon: Pill,            path: '/medicaments',  roles: ['ALL'] },
  { label: 'Stock & Lots', icon: Package,         path: '/stock',        roles: ['ALL'] },
  { label: 'Ventes',       icon: ShoppingCart,    path: '/ventes',       roles: ['ALL'] },
  { label: 'Ordonnances',  icon: FileText,        path: '/ordonnances',  roles: ['ALL'] },
  { label: 'Commandes',    icon: Truck,           path: '/commandes',    roles: ['ADMIN','PHARMACIEN','GESTIONNAIRE_STOCK'] },
  { label: 'Fournisseurs', icon: Building2,       path: '/fournisseurs', roles: ['ADMIN','PHARMACIEN','GESTIONNAIRE_STOCK'] },
  { label: 'Inventaire',   icon: Archive,         path: '/inventaire',   roles: ['ADMIN','PHARMACIEN','GESTIONNAIRE_STOCK'] },
  { label: 'Alertes',      icon: Bell,            path: '/alertes',      roles: ['ADMIN','PHARMACIEN','GESTIONNAIRE_STOCK'] },
  { label: 'Rapports',     icon: BarChart2,       path: '/rapports',     roles: ['ADMIN','PHARMACIEN'] },
  { label: 'Audit',        icon: Shield,          path: '/audit',        roles: ['ADMIN','PHARMACIEN'] },
  { label: 'Utilisateurs', icon: Users,           path: '/utilisateurs', roles: ['ADMIN'] },
];

const ROLE_LABELS = {
  ADMIN:              { label: 'Administrateur', color: 'bg-red-500/20 text-red-300' },
  PHARMACIEN:         { label: 'Pharmacien',     color: 'bg-primary-400/20 text-primary-300' },
  CAISSIER:           { label: 'Caissier',       color: 'bg-sky-500/20 text-sky-300' },
  GESTIONNAIRE_STOCK: { label: 'Gestionnaire',   color: 'bg-amber-500/20 text-amber-300' },
};

export default function Sidebar({ open }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const roleInfo = ROLE_LABELS[user?.role] || {};

  return (
    <aside className={clsx(
      'bg-sidebar flex flex-col transition-all duration-300 shrink-0 h-screen',
      open ? 'w-60' : 'w-0 overflow-hidden'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
          <Cross size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">PharmaStock</p>
          <p className="text-primary-400 text-xs mt-0.5">Pro v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, path, roles }) => {
          const allowed = roles.includes('ALL') || roles.some(r => hasRole(r));
          if (!allowed) return null;
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink key={path} to={path} className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
              active
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm'
                : 'text-primary-200/70 hover:text-white hover:bg-white/8'
            )}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-white/8 pt-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.prenom} {user?.nom}</p>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', roleInfo.color)}>
              {roleInfo.label}
            </span>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
          text-primary-200/60 hover:text-red-400 hover:bg-white/8 text-sm transition-all duration-150">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
