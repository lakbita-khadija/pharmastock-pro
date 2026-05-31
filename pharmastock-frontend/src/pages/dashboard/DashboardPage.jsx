// src/pages/dashboard/DashboardPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, alerteAPI } from '../../api/services';
import {
  Package, ShoppingCart, Bell, TrendingUp,
  AlertTriangle, CheckCircle, ArrowRight, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

// ── Composant KPI Card ──
function StatCard({ label, value, icon: Icon, color, sub, trend }) {
  return (
    <div className="card p-5 flex items-start gap-4 animate-fade-in-up hover:shadow-md transition-shadow">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon size={20} className="text-white" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-slate-800 leading-none">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
        {sub && (
          <p className={clsx('text-xs font-medium mt-1.5', trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400')}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Tooltip personnalisé Recharts ──
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs border border-slate-100">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name} : <strong>{p.value.toLocaleString('fr-MA')} DH</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn:  () => dashboardAPI.getKpis().then(r => r.data),
    refetchInterval: 120_000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart', 'month'],
    queryFn:  () => dashboardAPI.getVentesChart('month').then(r => r.data),
  });

  const { data: topMeds } = useQuery({
    queryKey: ['dashboard-top'],
    queryFn:  () => dashboardAPI.getTopMeds().then(r => r.data),
  });

  const { data: alertes } = useQuery({
    queryKey: ['alertes-recentes'],
    queryFn:  () => alerteAPI.getAll({ statut: 'ACTIVE', size: 5 }).then(r => r.data.content),
  });

  const ALERT_STYLES = {
    CRITIQUE:      { cls: 'bg-red-100 text-red-700',    icon: AlertTriangle },
    AVERTISSEMENT: { cls: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    INFO:          { cls: 'bg-sky-100 text-sky-700',     icon: Activity },
  };

  return (
    <div className="page-container space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Tableau de bord</h2>
          <p className="page-subtitle">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <button
          onClick={() => navigate('/ventes/new')}
          className="btn-primary"
        >
          <ShoppingCart size={16} />
          Nouvelle vente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Valeur totale du stock"
          value={kpis ? `${Number(kpis.valeurStock).toLocaleString('fr-MA')} DH` : '—'}
          icon={Package}
          color="bg-primary-600"
          sub={kpis ? `${kpis.nbMedicaments} références actives` : null}
        />
        <StatCard
          label="CA du jour"
          value={kpis ? `${Number(kpis.caJour).toLocaleString('fr-MA')} DH` : '—'}
          icon={ShoppingCart}
          color="bg-accent-600"
          sub={kpis ? `${kpis.ventesJour} ventes aujourd'hui` : null}
          trend="up"
        />
        <StatCard
          label="Alertes actives"
          value={kpis?.alertesActives ?? '—'}
          icon={Bell}
          color={kpis?.alertesActives > 0 ? 'bg-red-500' : 'bg-slate-400'}
          sub={kpis?.alertesCritiques > 0 ? `${kpis.alertesCritiques} critiques` : 'Aucune alerte critique'}
          trend={kpis?.alertesCritiques > 0 ? 'down' : null}
        />
        <StatCard
          label="CA du mois"
          value={kpis ? `${Number(kpis.caMois).toLocaleString('fr-MA')} DH` : '—'}
          icon={TrendingUp}
          color="bg-violet-600"
          sub={kpis ? `vs mois dernier : ${kpis.evoCaMois > 0 ? '+' : ''}${kpis.evoCaMois}%` : null}
          trend={kpis?.evoCaMois > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts + Alertes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Graphique ventes */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp size={15} className="text-primary-600" />
              Évolution des ventes — 30 derniers jours
            </h3>
          </div>
          <div className="p-5">
            {chartData?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2C4A8C" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2C4A8C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                         tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Ventes"
                        stroke="#2C4A8C" strokeWidth={2} fill="url(#gVentes)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                Données non disponibles
              </div>
            )}
          </div>
        </div>

        {/* Alertes récentes */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Bell size={15} className="text-red-500" />
              Alertes actives
            </h3>
            <button
              onClick={() => navigate('/alertes')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Voir tout <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {alertes?.length ? alertes.map((a) => {
              const style = ALERT_STYLES[a.niveau] || ALERT_STYLES['INFO'];
              const Icon  = style.icon;
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', style.cls)}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{a.medicament?.nomCommercial}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{a.message}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm">Aucune alerte active</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top médicaments */}
      {topMeds?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top 10 médicaments — CA du mois</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topMeds} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                       tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="nom" type="category" tick={{ fontSize: 11, fill: '#64748b' }}
                       axisLine={false} tickLine={false} width={140} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-MA')} DH`, 'CA']} />
                <Bar dataKey="ca" fill="#2C4A8C" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
