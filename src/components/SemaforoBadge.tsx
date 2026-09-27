import React from 'react';
import { SemaforoStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface SemaforoBadgeProps {
  status: SemaforoStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulsing?: boolean;
}

export const SemaforoBadge: React.FC<SemaforoBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  pulsing = true,
}) => {
  const configs = {
    GREEN: {
      label: 'VALE A PENA',
      sublabel: 'Excelente',
      color: 'bg-emerald-500 text-slate-950',
      border: 'border-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      glow: pulsing ? 'glow-green' : '',
      icon: CheckCircle2,
    },
    YELLOW: {
      label: 'ATENÇÃO',
      sublabel: 'Analise',
      color: 'bg-amber-500 text-slate-950',
      border: 'border-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotColor: 'bg-amber-400',
      glow: pulsing ? 'glow-yellow' : '',
      icon: AlertTriangle,
    },
    RED: {
      label: 'NÃO COMPENSA',
      sublabel: 'Pule!',
      color: 'bg-rose-500 text-white',
      border: 'border-rose-400',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotColor: 'bg-rose-400',
      glow: pulsing ? 'glow-red' : '',
      icon: XCircle,
    },
  };

  const current = configs[status];
  const Icon = current.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${current.badgeBg} ${current.glow}`}>
        <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
        {showLabel && current.label}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-sm tracking-wide border-2 ${current.color} ${current.border} shadow-lg ${current.glow}`}>
        <Icon className="w-5 h-5" />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-xs uppercase opacity-85 font-extrabold">{current.sublabel}</span>
          <span>{current.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-xs tracking-wider border ${current.badgeBg} ${current.glow}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${current.dotColor}`} />
      <Icon className="w-4 h-4" />
      <span>{current.label}</span>
    </div>
  );
};
