import React, { useState, useEffect } from 'react';
import { Ride, DriverSettings, AppSource } from '../types';
import { PRESET_RIDES } from '../utils/mockRides';
import { evaluateRide } from '../utils/calculator';
import { FloatingOverlaySimulator } from './FloatingOverlaySimulator';
import { 
  Play, 
  MapPin, 
  User, 
  Clock, 
  Smartphone, 
  Compass, 
  RotateCcw, 
  Volume2, 
  ShieldCheck, 
  Eye, 
  Zap,
  Sliders
} from 'lucide-react';
import { playAlertBeep, announceRide } from '../utils/speech';

interface MobileSimulatorProps {
  settings: DriverSettings;
  activeRide: Ride | null;
  onRideTriggered: (ride: Ride) => void;
  onRideAccepted: (ride: Ride) => void;
  onRideRejected: (ride: Ride) => void;
  onCloseOverlay: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  settings,
  activeRide,
  onRideTriggered,
  onRideAccepted,
  onRideRejected,
  onCloseOverlay,
}) => {
  const [activeApp, setActiveApp] = useState<AppSource>('uber');
  const [countdown, setCountdown] = useState<number>(20);
  const [isSimulatingTimer, setIsSimulatingTimer] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Position of the floating overlay inside the simulated phone screen (allows dragging anywhere)
  const getInitialPosition = () => {
    switch (settings.overlayPositionDefault) {
      case 'top-right': return { x: 195, y: 70 };
      case 'middle-left': return { x: 8, y: 260 };
      case 'middle-right': return { x: 195, y: 260 };
      case 'bottom-left': return { x: 8, y: 460 };
      case 'bottom-right': return { x: 195, y: 460 };
      case 'top-left':
      default:
        return { x: 8, y: 70 };
    }
  };

  const [overlayPosition, setOverlayPosition] = useState<{ x: number; y: number }>(getInitialPosition);

  // Sync when default position setting changes
  useEffect(() => {
    setOverlayPosition(getInitialPosition());
  }, [settings.overlayPositionDefault]);

  // Custom ride inputs
  const [customGross, setCustomGross] = useState(35.0);
  const [customKmPickup, setCustomKmPickup] = useState(1.5);
  const [customKmTrip, setCustomKmTrip] = useState(8.5);
  const [customMin, setCustomMin] = useState(20);

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeRide && isSimulatingTimer && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0 && activeRide) {
      // Auto expire
      onRideRejected(activeRide);
      setIsSimulatingTimer(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, activeRide, isSimulatingTimer, onRideRejected]);

  const triggerPresetRide = (index: number) => {
    const raw = PRESET_RIDES[index % PRESET_RIDES.length];
    setActiveApp(raw.app);
    const ride = evaluateRide(raw, settings);
    setCountdown(20);
    setIsSimulatingTimer(true);
    playAlertBeep(ride.semaforo);
    if (settings.autoSpeechAlert) {
      announceRide(ride, true, settings.speechVolume);
    }
    onRideTriggered(ride);
  };

  const triggerCustomRide = () => {
    const ride = evaluateRide(
      {
        app: activeApp,
        grossFare: customGross,
        distancePickupKm: customKmPickup,
        distanceTripKm: customKmTrip,
        durationMinutes: customMin,
        pickupAddress: 'Av. Paulista, 1578 - Bela Vista',
        dropoffAddress: 'Rua Oscar Freire, 900 - Jardins',
        passengerName: 'Passageiro Teste',
        passengerRating: 4.92,
        category: activeApp === 'uber' ? 'UberX' : activeApp === '99' ? '99Pop' : 'inDrive',
      },
      settings
    );
    setShowCustomModal(false);
    setCountdown(20);
    setIsSimulatingTimer(true);
    playAlertBeep(ride.semaforo);
    if (settings.autoSpeechAlert) {
      announceRide(ride, true, settings.speechVolume);
    }
    onRideTriggered(ride);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center p-2 sm:p-4">
      {/* Control Panel for Simulation */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-100">Disparar Corridas de Teste</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Simule a recepção de corridas para ver a Janela Flutuante do Vingadores Copiloto calcular o semáforo e lucro líquido em tempo real.
          </p>

          {/* Quick presets by color */}
          <div className="space-y-2">
            <button
              onClick={() => triggerPresetRide(0)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Testar Corrida Verde (Top)</span>
              </div>
              <span className="font-mono text-emerald-400 font-extrabold">R$ 42,80</span>
            </button>

            <button
              onClick={() => triggerPresetRide(3)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-between transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>🟡 Testar Corrida Amarela (Alerta)</span>
              </div>
              <span className="font-mono text-amber-400 font-extrabold">R$ 22,40</span>
            </button>

            <button
              onClick={() => triggerPresetRide(5)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-between transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>🔴 Testar Corrida Vermelha (Pular!)</span>
              </div>
              <span className="font-mono text-rose-400 font-extrabold">R$ 11,20</span>
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simular Corrida com Seus Valores</span>
            </button>
          </div>

          {/* App Switcher Tabs */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Aplicativo Ativo na Tela do Celular:
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveApp('uber')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeApp === 'uber' ? 'bg-black text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Uber
              </button>
              <button
                onClick={() => setActiveApp('99')}
                className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeApp === '99' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                99
              </button>
              <button
                onClick={() => setActiveApp('indrive')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeApp === 'indrive' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                inDrive
              </button>
            </div>
          </div>

          {/* Posicionamento do Popup Flutuante */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Posição do Popup na Tela:
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                (Arraste livremente)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                onClick={() => setOverlayPosition({ x: 8, y: 70 })}
                className="py-1.5 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-bold text-center cursor-pointer transition-colors"
                title="Canto Superior Esquerdo"
              >
                ↖ Esq. Sup
              </button>
              <button
                onClick={() => setOverlayPosition({ x: 195, y: 70 })}
                className="py-1.5 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-bold text-center cursor-pointer transition-colors"
                title="Canto Superior Direito"
              >
                ↗ Dir. Sup
              </button>
              <button
                onClick={() => setOverlayPosition({ x: 8, y: 260 })}
                className="py-1.5 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-bold text-center cursor-pointer transition-colors"
                title="Meio Esquerdo"
              >
                ← Meio Esq
              </button>
              <button
                onClick={() => setOverlayPosition({ x: 195, y: 260 })}
                className="py-1.5 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-bold text-center cursor-pointer transition-colors"
                title="Meio Direito"
              >
                → Meio Dir
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
              💡 Você pode clicar e arrastar o popup segurando em qualquer lugar dele na tela do celular para posicionar onde for mais confortável.
            </p>
          </div>
        </div>

        {/* Accessibility Status Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Acessibilidade Android Ativa</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            O Vingadores Copiloto escuta os textos gerados pelo Android Accessibility Node Info de cada tela e extrai valor, km e tempo instantaneamente.
          </p>
        </div>
      </div>

      {/* Realistic Mobile Device Container */}
      <div className="relative w-full max-w-[380px] h-[720px] bg-slate-950 rounded-[48px] p-3.5 ring-8 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-slate-700/50 flex flex-col overflow-hidden">
        {/* Android Punch Hole & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-black ring-2 ring-slate-800/80" />
        </div>

        {/* Android Status Bar */}
        <div className="relative z-40 flex items-center justify-between text-[11px] text-slate-300 font-bold px-4 pt-1.5 pb-2">
          <span>14:05</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400">5G</span>
            <span>98%</span>
          </div>
        </div>

        {/* Simulated Mobile Screen Content (Underneath Overlay) */}
        <div className="relative flex-1 rounded-[34px] overflow-hidden bg-slate-900 flex flex-col border border-slate-800">
          {/* Simulated Driver App View */}
          {activeApp === 'uber' && (
            <div className="flex-1 bg-zinc-950 flex flex-col justify-between p-4 relative overflow-hidden select-none">
              {/* Fake GPS Map Grid */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Fake Roads on map */}
              <div className="absolute inset-0 pointer-events-none opacity-25">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0,200 Q 150,150 350,300" stroke="#60a5fa" strokeWidth="6" fill="none" />
                  <path d="M 100,0 L 250,600" stroke="#94a3b8" strokeWidth="4" fill="none" />
                  <path d="M 30,500 L 320,100" stroke="#94a3b8" strokeWidth="3" fill="none" />
                </svg>
              </div>

              {/* Uber Header */}
              <div className="relative z-10 flex items-center justify-between bg-zinc-900/90 backdrop-blur rounded-2xl p-3 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white text-black font-black rounded-lg flex items-center justify-center text-xs">
                    U
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Uber Driver</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">● Online • R$ 142,50 hoje</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                  GPS SP
                </div>
              </div>

              {/* Simulated Native Incoming Offer Card on Uber */}
              {activeRide ? (
                <div className="relative z-10 bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-wider">{activeRide.category}</span>
                    <span className="text-2xl font-black text-white">R$ {activeRide.grossFare.toFixed(2)}</span>
                  </div>

                  {/* Countdown bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-1000"
                      style={{ width: `${(countdown / 20) * 100}%` }}
                    />
                  </div>

                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{activeRide.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      <span className="truncate">{activeRide.dropoffAddress}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-3 text-[11px] text-zinc-400 border-t border-zinc-800 pt-2 font-mono">
                    <span>{activeRide.distancePickupKm} km até o local</span>
                    <span>{activeRide.distanceTripKm} km viagem ({activeRide.durationMinutes} min)</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center my-auto p-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400 mb-3 animate-pulse">
                    <Compass className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Aguardando Viagens</h4>
                  <p className="text-xs text-zinc-400">
                    O Vingadores Copiloto está monitorando a tela em segundo plano.
                  </p>
                </div>
              )}

              {/* Bottom bar of Uber */}
              <div className="relative z-10 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex justify-around text-zinc-400 text-xs font-semibold">
                <span className="text-white">Procurando</span>
                <span>Ganhos</span>
                <span>Oportunidades</span>
              </div>
            </div>
          )}

          {activeApp === '99' && (
            <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden select-none">
              <div className="relative z-10 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-500 text-black font-black rounded-lg flex items-center justify-center text-xs">
                    99
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-400">99 Motorista</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">● Disponível • Alta demanda</div>
                  </div>
                </div>
              </div>

              {activeRide ? (
                <div className="relative z-10 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl text-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase">
                      99Pop
                    </span>
                    <span className="text-2xl font-black text-amber-400">R$ {activeRide.grossFare.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 truncate">{activeRide.pickupAddress}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">Destino: {activeRide.dropoffAddress}</p>
                </div>
              ) : (
                <div className="relative z-10 text-center my-auto p-4">
                  <p className="text-xs text-amber-300/80">99 Motorista aguardando chamadas...</p>
                </div>
              )}

              <div className="relative z-10 bg-slate-900 p-2 rounded-xl text-center text-xs text-slate-400">
                99 Motorista Conectado
              </div>
            </div>
          )}

          {activeApp === 'indrive' && (
            <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden select-none">
              <div className="relative z-10 flex items-center justify-between bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-500 text-black font-black rounded-lg flex items-center justify-center text-xs">
                    in
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-400">inDrive</div>
                    <div className="text-[10px] text-slate-300 font-semibold">Ofertas de Passageiros</div>
                  </div>
                </div>
              </div>

              {activeRide ? (
                <div className="relative z-10 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                      Oferta do Usuário
                    </span>
                    <span className="text-2xl font-black text-emerald-400">R$ {activeRide.grossFare.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 truncate">{activeRide.pickupAddress}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">Para: {activeRide.dropoffAddress}</p>
                </div>
              ) : (
                <div className="relative z-10 text-center my-auto p-4">
                  <p className="text-xs text-emerald-400/80">inDrive radar ativo...</p>
                </div>
              )}

              <div className="relative z-10 bg-slate-900 p-2 rounded-xl text-center text-xs text-slate-400">
                inDrive Conectado
              </div>
            </div>
          )}

          {/* THE FLOATING OVERLAY: Ultra-compact popup draggable to anywhere on the screen */}
          {activeRide && (
            <div
              style={{
                left: `${overlayPosition.x}px`,
                top: `${overlayPosition.y}px`,
              }}
              className="absolute z-50 animate-in fade-in zoom-in-95 duration-200"
            >
              <FloatingOverlaySimulator
                ride={activeRide}
                settings={settings}
                position={overlayPosition}
                onPositionChange={setOverlayPosition}
                onAccept={(r) => {
                  setIsSimulatingTimer(false);
                  onRideAccepted(r);
                }}
                onReject={(r) => {
                  setIsSimulatingTimer(false);
                  onRideRejected(r);
                }}
                onClose={onCloseOverlay}
              />
            </div>
          )}
        </div>

        {/* Android Navigation Bar */}
        <div className="flex items-center justify-around py-2 pt-2.5 text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-slate-600 rounded-sm" />
          <div className="w-3.5 h-3.5 border-2 border-slate-600 rounded-full" />
          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-600" />
        </div>
      </div>

      {/* Custom Ride Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Simular Corrida Personalizada
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Valor da Corrida (R$)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customGross}
                  onChange={(e) => setCustomGross(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Km até passageiro</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customKmPickup}
                    onChange={(e) => setCustomKmPickup(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Km da Viagem</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customKmTrip}
                    onChange={(e) => setCustomKmTrip(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Tempo Estimado (minutos)</label>
                <input
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={triggerCustomRide}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                Simular Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
