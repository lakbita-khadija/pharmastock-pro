import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Cross, Lock, Mail, AlertCircle, Leaf } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setLoading(true); setApiError('');
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setApiError('Email ou mot de passe incorrect.');
      else if (status === 403) setApiError('Compte verrouillé. Contactez l\'administrateur.');
      else setApiError('Erreur de connexion. Réessayez.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche — vert pharmacie */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #042f2e 0%, #0f766e 50%, #14b8a6 100%)' }}>

        {/* Décorations */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-primary-300/40" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-primary-200/40" />

        {/* Croix médicale animée */}
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
            <div className="relative bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center w-full h-full border border-white/20 shadow-2xl">
              <Cross size={42} className="text-white" strokeWidth={1.8} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
            PharmaStock<br />
            <span className="text-primary-200 font-light">Pro</span>
          </h1>
          <p className="text-primary-100/80 text-sm leading-relaxed mb-10">
            Système intelligent de gestion de stock pour pharmacies modernes. Traçabilité des lots, alertes automatiques et rapports analytiques.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Traçabilité', icon: '🔍' },
              { label: 'Alertes temps réel', icon: '🔔' },
              { label: 'Sécurisé JWT', icon: '🔐' },
            ].map(({ label, icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-primary-100 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 justify-center text-primary-200/60 text-xs">
            <Leaf size={12} />
            <span>Solution professionnelle dédiée aux pharmaciens</span>
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary-50/30 to-white">
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Cross size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">PharmaStock Pro</p>
              <p className="text-xs text-slate-500">Gestion de stock pharmacie</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Connexion</h2>
            <p className="text-sm text-slate-500">Accédez à votre espace pharmacie.</p>
          </div>

          {/* Erreur */}
          {apiError && (
            <div className="alert-danger mb-5 rounded-lg animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            <div className="form-group">
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" placeholder="pharmacien@pharmacie.ma"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', {
                    required: 'L\'email est requis.',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide.' },
                  })} />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`input pl-9 pr-9 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Le mot de passe est requis.' })} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Comptes démo */}
          <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Cross size={10} /> Comptes de démonstration
            </p>
            <div className="space-y-2">
              {[
                { role: 'Admin',        email: 'admin@pharma.ma' },
                { role: 'Pharmacien',   email: 'pharma@pharma.ma' },
                { role: 'Caissier',     email: 'caissier@pharma.ma' },
                { role: 'Gestionnaire', email: 'gestion@pharma.ma' },
              ].map(({ role, email }) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-800">{role}</span>
                  <span className="text-xs font-mono text-slate-500">{email}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-primary-100">
                Mot de passe : <code className="bg-white px-1 py-0.5 rounded text-primary-700">Admin123!</code>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
