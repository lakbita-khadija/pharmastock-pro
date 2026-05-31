// src/pages/utilisateurs/UtilisateursPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilisateurAPI } from '../../api/services';
import { Plus, Users, Unlock, UserX, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import UtilisateurModal from './UtilisateurModal';

const ROLE_CONFIG = {
  ADMIN:              { label: 'Admin',        cls: 'badge-danger'   },
  PHARMACIEN:         { label: 'Pharmacien',   cls: 'badge-success'  },
  CAISSIER:           { label: 'Caissier',     cls: 'badge-info'     },
  GESTIONNAIRE_STOCK: { label: 'Gestionnaire', cls: 'badge-warning'  },
};

export default function UtilisateursPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: utilisateurs, isLoading } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: () => utilisateurAPI.getAll().then(r => r.data),
  });

  const deverrouillerMutation = useMutation({
    mutationFn: (id) => utilisateurAPI.deverrouiller(id),
    onSuccess: () => { toast.success('Compte déverrouillé.'); qc.invalidateQueries(['utilisateurs']); },
  });

  const desactiverMutation = useMutation({
    mutationFn: (id) => utilisateurAPI.desactiver(id),
    onSuccess: () => { toast.success('Compte désactivé.'); qc.invalidateQueries(['utilisateurs']); },
  });

  const users = utilisateurs || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Gestion des utilisateurs</h2>
          <p className="page-subtitle">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Tableau */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Dernière connexion</th>
              <th>Tentatives échouées</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-24" /></td>
                ))}</tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun utilisateur</p>
              </td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.prenom?.[0]}{u.nom?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{u.prenom} {u.nom}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm text-slate-600 font-mono text-xs">{u.email}</td>
                <td>
                  <span className={`badge ${ROLE_CONFIG[u.role]?.cls || 'badge-gray'}`}>
                    {ROLE_CONFIG[u.role]?.label || u.role}
                  </span>
                </td>
                <td className="text-sm text-slate-600">
                  {u.derniereConnexion
                    ? format(new Date(u.derniereConnexion), 'dd MMM yyyy HH:mm', { locale: fr })
                    : <span className="text-slate-400">—</span>
                  }
                </td>
                <td>
                  <span className={clsx('text-sm font-semibold',
                    u.tentativesEchec >= 5 ? 'text-red-600'
                    : u.tentativesEchec >= 3 ? 'text-amber-600'
                    : 'text-slate-600'
                  )}>
                    {u.tentativesEchec} / 5
                  </span>
                </td>
                <td>
                  <span className={clsx('badge', u.actif ? 'badge-success' : 'badge-danger')}>
                    {u.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {u.tentativesEchec >= 5 && (
                    <span className="badge badge-danger ml-1">Verrouillé</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModal(u)}
                      className="btn-icon btn-ghost text-slate-400 hover:text-amber-600"
                      title="Modifier"
                    >
                      <Edit size={15} />
                    </button>
                    {u.tentativesEchec >= 5 && (
                      <button
                        onClick={() => deverrouillerMutation.mutate(u.id)}
                        className="btn-icon btn-ghost text-slate-400 hover:text-emerald-600"
                        title="Déverrouiller"
                      >
                        <Unlock size={15} />
                      </button>
                    )}
                    {u.actif && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ?`))
                            desactiverMutation.mutate(u.id);
                        }}
                        className="btn-icon btn-ghost text-slate-400 hover:text-red-600"
                        title="Désactiver"
                      >
                        <UserX size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <UtilisateurModal
          utilisateur={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); qc.invalidateQueries(['utilisateurs']); }}
        />
      )}
    </div>
  );
}
