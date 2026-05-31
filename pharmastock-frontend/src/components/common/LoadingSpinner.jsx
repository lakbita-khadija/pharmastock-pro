// src/components/common/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sz = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sz} border-[3px] border-primary-100 border-t-primary-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}
