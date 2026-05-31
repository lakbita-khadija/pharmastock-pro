// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { alerteAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',           subtitle: 'Vue d\'ensemble en temps réel' },
  '/medicaments':  { title: 'Médicaments',          subtitle: 'Gestion du catalogue' },
  '/stock':        { title: 'Stock & Lots',         subtitle: 'Inventaire et traçabilité' },
  '/ventes':       { title: 'Ventes',               subtitle: 'Historique et nouvelle vente' },
  '/commandes':    { title: 'Commandes',            subtitle: 'Approvisionnement fournisseurs' },
  '/inventaire':   { title: 'Inventaire',           subtitle: 'Comptage et régularisation' },
  '/alertes':      { title: 'Alertes',              subtitle: 'Notifications actives' },
  '/rapports':     { title: 'Rapports',             subtitle: 'Analyses et exports' },
  '/utilisateurs': { title: 'Utilisateurs',         subtitle: 'Gestion des accès' },
};

export default function Header({ onMenuClick }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isPharmacien } = useAuth();

  const base = '/' + location.pathname.split('/')[1];
  const pageInfo = PAGE_TITLES[base] || { title: 'PharmaStock Pro', subtitle: '' };

  // Compteur d'alertes actives
  const { data: alertCount } = useQuery({
    queryKey: ['alertes-count'],
    queryFn:  () => alerteAPI.getCount().then(r => r.data.count),
    refetchInterval: 60_000, // rafraîchit chaque minute
    enabled: isPharmacien,
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0 z-10">

      {/* Bouton menu (mobile / collapse) */}
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Titre de la page courante */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-800 leading-none truncate">
          {pageInfo.title}
        </h1>
        {pageInfo.subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{pageInfo.subtitle}</p>
        )}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">

        {/* Bouton Alertes */}
        {isPharmacien && (
          <button
            onClick={() => navigate('/alertes')}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Alertes"
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white
                               text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>
        )}

        {/* Bouton Nouvelle vente */}
        <button
          onClick={() => navigate('/ventes/new')}
          className="btn-primary text-xs py-1.5 px-3"
        >
          + Nouvelle vente
        </button>
      </div>
    </header>
  );
}
