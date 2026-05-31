// src/pages/inventaire/InventairePage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventaireAPI } from '../../api/services';
import { Archive, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUT_CONFIG = {
  EN_COURS:  { label: 'En cours',  cls: 'badge-warning' },
  VALIDE:    { label: 'Validé',    cls: 'badge-success' },
  ANNULE:    { label: 'Annulé',    cls: 'badge-danger'  },
};

export default function InventairePage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: inventaires, isLoading } = useQuery({
    queryKey: ['inventaires'],
    queryFn: () => inventaireAPI.getAll().then(r => r.data),
  });

  const demarrerMutation = useMutation({
    mutationFn: (data) => inventaireAPI.demarrer(data),
    onSuccess: () => {
      toast.success('Inventaire démarré.');
      qc.invalidateQueries(['inventaires']);
      setCreating(false);
    },
    onError: () => toast.error('Erreur lors du démarrage.'),
  });

  const validerMutation = useMutation({
    mutationFn: (id) => inventaireAPI.valider(id),
    onSuccess: () => {
      toast.success('Inventaire validé. Stock régularisé.');
      qc.invalidateQueries(['inventaires']);
    },
  });

  const list = inventaires || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Inventaire physique</h2>
          <p className="page-subtitle">Comptage et régularisation du stock</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> Démarrer un inventaire
        </button>
      </div>

      {/* Info processus */}
      <div className="alert-info">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Comment ça marche :</strong> Démarrez un inventaire → saisissez les quantités physiques comptées → validez pour régulariser automatiquement le stock. Le rapport d'écarts est généré à la validation.
        </div>
      </div>

      {/* Formulaire démarrage */}
      {creating && (
        <div className="card p-5 border-2 border-primary-200 animate-fade-in-up">
          <h3 className="font-semibold text-slate-800 mb-4">Nouvel inventaire</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Type</label>
              <select className="select" id="inv-type">
                <option value="TOTAL">Inventaire total</option>
                <option value="PARTIEL">Inventaire partiel (par catégorie)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Responsable</label>
              <input className="input" placeholder="Nom du responsable" id="inv-responsable" />
            </div>
            <div className="form-group">
              <label className="label">Commentaire</label>
              <input className="input" placeholder="Optionnel" id="inv-comment" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                const type = document.getElementById('inv-type').value;
                const responsable = document.getElementById('inv-responsable').value;
                const commentaire = document.getElementById('inv-comment').value;
                demarrerMutation.mutate({ type, responsable, commentaire });
              }}
              disabled={demarrerMutation.isPending}
              className="btn-primary"
            >
              {demarrerMutation.isPending ? 'Démarrage…' : 'Démarrer l\'inventaire'}
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste inventaires */}
      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Type</th>
              <th>Date</th>
              <th>Responsable</th>
              <th>Articles comptés</th>
              <th>Écarts</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                  <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-20" /></td>
                ))}</tr>
              ))
            ) : list.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                <Archive size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun inventaire enregistré</p>
              </td></tr>
            ) : list.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    INV-{String(inv.id).padStart(4, '0')}
                  </span>
                </td>
                <td className="text-sm text-slate-600">{inv.type || 'Total'}</td>
                <td className="text-sm text-slate-600">
                  {format(new Date(inv.dateDebut || inv.dateCreation), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="text-sm text-slate-600">{inv.responsable || '—'}</td>
                <td className="text-sm text-slate-600">{inv.nbArticles ?? '—'}</td>
                <td>
                  {inv.nbEcarts > 0 ? (
                    <span className="badge badge-warning">{inv.nbEcarts} écart{inv.nbEcarts > 1 ? 's' : ''}</span>
                  ) : inv.statut === 'VALIDE' ? (
                    <span className="badge badge-success">Aucun écart</span>
                  ) : <span className="text-slate-400 text-sm">—</span>}
                </td>
                <td>
                  <span className={`badge ${STATUT_CONFIG[inv.statut]?.cls || 'badge-gray'}`}>
                    {STATUT_CONFIG[inv.statut]?.label || inv.statut}
                  </span>
                </td>
                <td>
                  {inv.statut === 'EN_COURS' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Valider cet inventaire et régulariser le stock ?'))
                          validerMutation.mutate(inv.id);
                      }}
                      className="btn-sm btn-success"
                    >
                      <CheckCircle size={13} /> Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
