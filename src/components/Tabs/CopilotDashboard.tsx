import React from 'react';
import { Ride, DriverSettings, DaySummary } from '../../types';
import { SemaforoBadge } from '../SemaforoBadge';
import { 
  DollarSign, 
  TrendingUp, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Play, 
  Sparkles, 
  Fuel, 
  ArrowUpRight, 
  Car, 
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculator';

interface CopilotDashboardProps {
  rides: Ride[];
  settings: DriverSettings;
  onSelectRide: (ride: Ride) => void;
  onOpenSimulator: () => void;
  onOpenNativeCode?: () => void;
  onQuickSimulate: (type: 'green' | 'yellow' | 'red') => void;
}

export const CopilotDashboard: React.FC<CopilotDashboardProps> = ({
  rides,
  settings,
  onSelectRide,
  onOpenSimulator,
  onOpenNativeCode,
  onQuickSimulate,
}) => {
  // Compute today's metrics
  const acceptedRides = rides.filter((r) => r.status === 'accepted' || r.status === 'completed');
  const rejectedRides = rides.filter((r) => r.status === 'rejected');

  const totalGross = acceptedRides.reduce((acc, r) => acc + r.grossFare, 0);
  const totalNet = acceptedRides.reduce((acc, r) => acc + r.netProfit, 0);
  const totalKm = acceptedRides.reduce((acc, r) => acc + r.totalDistanceKm, 0);
  const totalMinutes = acceptedRides.reduce((acc, r) => acc + r.durationMinutes, 0);
  const totalFuel = acceptedRides.reduce((acc, r) => acc + r.fuelCost, 0);

  const avgGrossPerKm = totalKm > 0 ? totalGross / totalKm : 0;
  const avgNetPerKm = totalKm > 0 ? totalNet / totalKm : 0;
  const avgGrossPerHour = totalMinutes > 0 ? (totalGross / totalMinutes) * 60 : 0;
  const avgNetPerHour = totalMinutes > 0 ? (totalNet / totalMinutes) * 60 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SISTEMA OPERACIONAL ATIVO
              </span>
              <span className="text-xs text-slate-400">
                Monitorando Uber, 99 e inDrive
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vingadores Copiloto pronto para guiar seu dia
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Leitura automática de tela via Acessibilidade. O Semáforo inteligente calcula o 
              <span className="text-emerald-400 font-bold"> lucro líquido real </span>
              descontando combustível ({settings.fuelConsumptionKmPerL} km/L), desgaste e custos fixos no instante que a chamada toca!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            {onOpenNativeCode && (
              <button
                onClick={onOpenNativeCode}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-300/60"
              >
                <ShieldCheck className="w-5 h-5 fill-slate-950" />
                <span>📲 GERAR APK ANDROID</span>
              </button>
            )}

            <button
              onClick={onOpenSimulator}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Simulador ao Vivo</span>
            </button>
          </div>
        </div>

        {/* Quick Test Bar inside banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Testar Semáforo Instantâneo:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onQuickSimulate('green')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all cursor-pointer"
            >
              🟢 Corrida Verde (Boa)
            </button>
            <button
              onClick={() => onQuickSimulate('yellow')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all cursor-pointer"
            >
              🟡 Corrida Amarela (Atenção)
            </button>
            <button
              onClick={() => onQuickSimulate('red')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition-all cursor-pointer"
            >
              🔴 Corrida Vermelha (Pular)
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs Grid (Large high-contrast display for drivers) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lucro Líquido Real */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Lucro Líquido Real</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(totalNet)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Sobrou limpo no seu bolso</span>
          </div>
        </div>

        {/* Faturamento Bruto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Faturamento Bruto</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalGross)}
          </div>
          <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
            <span>- {formatCurrency(totalFuel)} gasto em combustível</span>
          </div>
        </div>

        {/* Média R$ / Km Real */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Média por Km</span>
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
            {formatCurrency(avgGrossPerKm)}
            <span className="text-xs font-semibold text-slate-400">/km</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Líquido: {formatCurrency(avgNetPerKm)}/km
          </div>
        </div>

        {/* Média R$ / Hora */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Média por Hora</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
            {formatCurrency(avgGrossPerHour)}
            <span className="text-xs font-semibold text-slate-400">/h</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Líquido: {formatCurrency(avgNetPerHour)}/h
          </div>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Aceitas</div>
            <div className="text-lg font-black text-white">{acceptedRides.length} corridas</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Pula / Recusadas</div>
            <div className="text-lg font-black text-white">{rejectedRides.length} ruins</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Km Rodados</div>
            <div className="text-lg font-black text-white">{totalKm.toFixed(1)} km</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tempo em Corrida</div>
            <div className="text-lg font-black text-white">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
          </div>
        </div>
      </div>

      {/* Live Monitoring Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Feed do Semáforo ao Vivo (Últimas Corridas Interceptadas)
            </h3>
            <p className="text-xs text-slate-400">
              Corridas avaliadas em tempo real na tela do celular pelo leitor de Acessibilidade
            </p>
          </div>
        </div>

        {rides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
            <Car className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-bold text-slate-300">Nenhuma corrida registrada ainda</p>
            <p className="text-xs text-slate-500 mt-1">
              Abra o Simulador ou clique nos botões de teste acima para testar o Semáforo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {rides.slice(0, 6).map((ride) => (
              <div
                key={ride.id}
                onClick={() => onSelectRide(ride)}
                className="py-3 px-2 sm:px-4 rounded-xl hover:bg-slate-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                {/* App and Semáforo */}
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                    ride.app === 'uber' ? 'bg-black text-white border border-zinc-700' :
                    ride.app === '99' ? 'bg-amber-500 text-black font-extrabold' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {ride.app}
                  </span>

                  <SemaforoBadge status={ride.semaforo} size="sm" />

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{ride.category}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({ride.totalDistanceKm} km • {ride.durationMinutes} min)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                      {ride.pickupAddress} → {ride.dropoffAddress}
                    </div>
                  </div>
                </div>

                {/* Values & Profit */}
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-mono font-bold text-slate-400">
                      R$ {ride.ratePerKm.toFixed(2)}/km
                    </div>
                    <div className="text-sm font-black text-white font-mono">
                      R$ {ride.grossFare.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Lucro Líq.
                    </span>
                    <span className={`text-sm font-black font-mono ${
                      ride.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      R$ {ride.netProfit.toFixed(2)}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    ride.status === 'accepted' || ride.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : ride.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ride.status === 'accepted' ? 'Aceita' : ride.status === 'rejected' ? 'Pulada' : 'Avaliando'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
