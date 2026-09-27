import React, { useState, useRef, useEffect } from 'react';
import { Ride, DriverSettings } from '../types';
import { SemaforoBadge } from './SemaforoBadge';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Check, 
  Maximize2, 
  Minimize2, 
  GripHorizontal,
  Fuel, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { announceRide } from '../utils/speech';
import confetti from 'canvas-confetti';

interface FloatingOverlaySimulatorProps {
  ride: Ride | null;
  settings: DriverSettings;
  onAccept: (ride: Ride) => void;
  onReject: (ride: Ride) => void;
  onClose?: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
}

export const FloatingOverlaySimulator: React.FC<FloatingOverlaySimulatorProps> = ({
  ride,
  settings,
  onAccept,
  onReject,
  onClose,
  position,
  onPositionChange,
}) => {
  // Start in ultra-compact mode (micro widget)
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Dragging support inside mobile simulator container
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag when clicking non-button areas
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position?.x ?? 8,
      startY: position?.y ?? 60,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      // Restrict within phone boundaries (~350x640px)
      const newX = Math.max(4, Math.min(270, dragStartRef.current.startX + dx));
      const newY = Math.max(20, Math.min(540, dragStartRef.current.startY + dy));

      if (onPositionChange) {
        onPositionChange({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onPositionChange]);

  if (!ride) {
    return (
      <div 
        onPointerDown={handlePointerDown}
        className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg px-1.5 py-0.5 text-slate-400 text-[8px] shadow-xl flex items-center gap-1 cursor-grab active:cursor-grabbing select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
        <span className="font-bold">Copiloto</span>
      </div>
    );
  }

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    announceRide(ride, true, settings.speechVolume);
    setTimeout(() => setIsSpeaking(false), 2500);
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ride.semaforo === 'GREEN') {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7, x: 0.25 },
      });
    }
    onAccept(ride);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject(ride);
  };

  const appMeta = {
    uber: { name: 'Uber', bg: 'bg-black text-white border-zinc-700' },
    99: { name: '99', bg: 'bg-amber-500 text-black border-amber-400 font-extrabold' },
    indrive: { name: 'inDrive', bg: 'bg-emerald-600 text-white border-emerald-500' },
  }[ride.app];

  const semaforoBorder = {
    GREEN: 'border-emerald-500 shadow-emerald-500/40 ring-1 ring-emerald-500/30',
    YELLOW: 'border-amber-500 shadow-amber-500/40 ring-1 ring-amber-500/30',
    RED: 'border-rose-500 shadow-rose-500/40 ring-1 ring-rose-500/30',
  }[ride.semaforo];

  const semaforoPill = {
    GREEN: 'bg-emerald-500 text-slate-950 font-black',
    YELLOW: 'bg-amber-500 text-slate-950 font-black',
    RED: 'bg-rose-500 text-white font-black',
  }[ride.semaforo];

  // Tamanho do container configurável
  // mini = reduzido pela metade (~68px)
  // compact = ~115px
  // normal = ~180px
  const containerWidth =
    settings.overlaySize === 'normal'
      ? 'w-[180px]'
      : settings.overlaySize === 'compact'
      ? 'w-[115px]'
      : 'w-[70px]'; // mini = diminuído pela metade (~68-70px)

  const themeClasses =
    settings.overlayTheme === 'amoled'
      ? 'bg-black text-white'
      : settings.overlayTheme === 'high-contrast'
      ? 'bg-zinc-950 text-white border-2'
      : 'bg-slate-950/98 text-slate-100';

  const customOpacityStyle = {
    opacity: settings.overlayOpacity ?? 0.95,
  };

  // =========================================================================
  // 1. POPUP MICRO-COMPACTO (DIMINUÍDO PELA METADE: ~70px de largura)
  // Ocupa quase nada de espaço na tela do celular e é 100% arrastável
  // =========================================================================
  if (!isExpanded) {
    return (
      <div
        onPointerDown={handlePointerDown}
        style={customOpacityStyle}
        className={`${containerWidth} ${themeClasses} backdrop-blur-xl border-2 ${semaforoBorder} rounded-xl shadow-2xl overflow-hidden font-sans transition-all duration-150 select-none cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-85 scale-105 ring-2 ring-cyan-400' : ''
        }`}
      >
        {/* Micro Drag Handle Top Bar */}
        <div className="bg-slate-900/95 px-1 py-0.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-0.5 min-w-0">
            <GripHorizontal className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span className={`px-0.5 py-0 rounded text-[7px] font-black uppercase tracking-tighter border shrink-0 ${appMeta.bg}`}>
              {ride.app === 'indrive' ? 'inD' : ride.app}
            </span>
          </div>

          <div className="flex items-center shrink-0">
            <button
              onClick={handleSpeak}
              title="Ouvir áudio"
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              {isSpeaking ? (
                <VolumeX className="w-2 h-2 text-emerald-400 animate-pulse" />
              ) : (
                <Volume2 className="w-2 h-2" />
              )}
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              title="Expandir"
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <Maximize2 className="w-2 h-2" />
            </button>
          </div>
        </div>

        {/* Micro Semáforo Indicator */}
        <div className="p-0.5">
          <div className={`w-full py-0.5 px-0.5 rounded text-[8px] text-center uppercase tracking-tighter leading-none shadow-sm ${semaforoPill}`}>
            {ride.semaforo === 'GREEN'
              ? '🟢 BOA'
              : ride.semaforo === 'YELLOW'
              ? '🟡 ATENÇÃO'
              : '🔴 PULAR'}
          </div>
        </div>

        {/* Essential Figures (Valor Bruto + Lucro) */}
        <div className="px-1 py-0.5 space-y-0.5 text-center">
          {/* Valor Bruto */}
          <div className="text-[11px] font-black text-white font-mono leading-none tracking-tight">
            R${ride.grossFare.toFixed(0)}
          </div>

          {/* Lucro Líquido Real */}
          {(settings.overlayShowProfit ?? true) && (
            <div className={`text-[8px] font-mono font-black leading-none ${ride.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              +R${ride.netProfit.toFixed(0)}
            </div>
          )}

          {/* Km / Taxa */}
          {(settings.overlayShowKm ?? true) && (
            <div className="text-[7px] font-mono text-cyan-300 leading-none pt-0.5 border-t border-slate-800/80">
              R${ride.ratePerKm.toFixed(1)}/k
            </div>
          )}
        </div>

        {/* Decision Buttons (Micro) */}
        <div className="grid grid-cols-2 gap-0.5 p-0.5 pt-0">
          <button
            onClick={handleReject}
            title="Pular corrida"
            className="py-0.5 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-400 flex items-center justify-center cursor-pointer border border-slate-700"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>

          <button
            onClick={handleAccept}
            title="Aceitar corrida"
            className={`py-0.5 rounded font-black flex items-center justify-center active:scale-95 cursor-pointer shadow-sm ${
              ride.semaforo === 'GREEN'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : ride.semaforo === 'YELLOW'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODO EXPANDIDO (Com histórico detalhado, mapa e custos completos)
  // =========================================================================
  return (
    <div
      onPointerDown={handlePointerDown}
      className={`w-[230px] sm:w-[250px] bg-slate-950/98 backdrop-blur-xl border-2 ${semaforoBorder} rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100 transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-90 scale-102 ring-2 ring-cyan-400' : ''
      }`}
    >
      {/* Header with Drag Handle */}
      <div className="bg-slate-900/95 px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${appMeta.bg}`}>
            {ride.app}
          </span>
          <span className="text-[10px] text-slate-200 font-bold truncate">
            {ride.category}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSpeak}
            title="Ouvir análise por voz"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            {isSpeaking ? <VolumeX className="w-3 h-3 text-emerald-400 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            title="Minimizar para micro popup"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2.5 space-y-2">
        {/* Verdict Badge */}
        <div className="flex items-center justify-between gap-1.5">
          <SemaforoBadge status={ride.semaforo} size="sm" />
          <div className="text-right">
            <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">
              Lucro Líquido
            </span>
            <span className={`text-base font-black font-mono leading-none ${ride.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {ride.netProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Gross vs Rate per Km */}
        <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-bold text-slate-400 uppercase">Valor Bruto</div>
            <div className="text-xl font-black text-white font-mono tracking-tight">
              R$ {ride.grossFare.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-bold text-slate-400 uppercase">R$ / KM</div>
            <div className={`text-lg font-black font-mono ${ride.ratePerKm >= settings.minRatePerKmGreen ? 'text-emerald-400' : ride.ratePerKm >= settings.minRatePerKmYellow ? 'text-amber-400' : 'text-rose-400'}`}>
              R$ {ride.ratePerKm.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-4 gap-1 text-center font-mono">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-1">
            <span className="text-[7px] font-bold text-slate-400 uppercase block font-sans">R$/Hora</span>
            <span className="text-[10px] font-black text-cyan-300">R${ride.ratePerHour.toFixed(0)}</span>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-1">
            <span className="text-[7px] font-bold text-slate-400 uppercase block font-sans">Total</span>
            <span className="text-[10px] font-black text-slate-100">{ride.totalDistanceKm}km</span>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-1">
            <span className="text-[7px] font-bold text-slate-400 uppercase block font-sans">Tempo</span>
            <span className="text-[10px] font-black text-slate-100">{ride.durationMinutes}m</span>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-1">
            <span className="text-[7px] font-bold text-slate-400 uppercase block font-sans">Custos</span>
            <span className="text-[10px] font-black text-rose-300">R${ride.totalCost.toFixed(1)}</span>
          </div>
        </div>

        {/* Route info */}
        <div className="text-[9px] text-slate-400 space-y-0.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-900">
          <div className="truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{ride.pickupAddress}</span>
          </div>
          <div className="truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span className="truncate">{ride.dropoffAddress}</span>
          </div>
        </div>

        {/* Collapsible cost breakdown */}
        <div>
          <button
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="w-full flex items-center justify-between text-[9px] font-bold text-slate-400 hover:text-slate-200 py-0.5"
          >
            <span className="flex items-center gap-1">
              <Fuel className="w-2.5 h-2.5 text-amber-400" />
              Detalhamento de gastos reais
            </span>
            {showCostBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showCostBreakdown && (
            <div className="mt-1 p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[9px] space-y-0.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Combustível ({settings.fuelConsumptionKmPerL}km/L):</span>
                <span className="text-rose-300 font-mono">- R$ {ride.fuelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desgaste Mecânico:</span>
                <span className="text-rose-300 font-mono">- R$ {ride.wearCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custos Fixos Rateados:</span>
                <span className="text-rose-300 font-mono">- R$ {ride.fixedCostShare.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            onClick={handleReject}
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer border border-slate-700"
          >
            <X className="w-3 h-3 text-rose-400 stroke-[3]" />
            <span>PULAR</span>
          </button>

          <button
            onClick={handleAccept}
            className={`py-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-lg ${
              ride.semaforo === 'GREEN'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                : ride.semaforo === 'YELLOW'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>ACEITAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
