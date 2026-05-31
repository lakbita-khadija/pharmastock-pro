// src/components/common/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm animate-fade-in-up">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
            ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-amber-600'} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{title}</h3>
          <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button
              onClick={onConfirm}
              className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'} btn`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
