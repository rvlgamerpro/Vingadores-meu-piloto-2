import React from 'react';
import { Ride, DriverSettings } from '../types';
import { SemaforoBadge } from './SemaforoBadge';
import { 
  X, 
  MapPin, 
  Fuel, 
  Wrench, 
  Clock, 
  Navigation, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert,
  Car
} from 'lucide-react';

interface RideDetailModalProps {
  ride: Ride;
  settings: DriverSettings;
  onClose: () => void;
  onAccept?: (ride: Ride) => void;
  onReject?: (ride: Ride) => void;
}

export const RideDetailModal: React.FC<RideDetailModalProps> = ({
  ride,
  settings,
  onClose,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-black uppercase tracking-wider text-white">
              {ride.app}
            </span>
            <span className="text-sm font-bold text-slate-300">{ride.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Semáforo Verdict */}
        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Veredito do Vingadores Copiloto</div>
            <SemaforoBadge status={ride.semaforo} size="lg" />
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase mb-0.5">Lucro Líquido Real</div>
            <div className="text-2xl font-black text-emerald-400">
              R$ {ride.netProfit.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              R$ {ride.netRatePerKm.toFixed(2)}/km líquido
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300">
          <span className="font-bold text-slate-200">Análise do Copiloto: </span>
          {ride.semaforoReason}
        </div>

        {/* Financial Breakdown Table */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 text-xs">
          <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
            Demonstrativo Financeiro da Corrida
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-300 font-medium">Tarifa Bruta Recebida:</span>
            <span className="font-mono font-black text-white text-sm">R$ {ride.grossFare.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-rose-300">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              Gasto Estimado de Combustível ({ride.totalDistanceKm} km):
            </span>
            <span className="font-mono font-bold">- R$ {ride.fuelCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-rose-300">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Desgaste Mecânico (Pneus, Freios, Óleo):
            </span>
            <span className="font-mono font-bold">- R$ {ride.wearCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-rose-300">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-purple-400" />
              Rateio de Custos Fixos (Seguro, IPVA, MEI):
            </span>
            <span className="font-mono font-bold">- R$ {ride.fixedCostShare.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-black text-sm">
            <span className="text-slate-200">Total de Despesas:</span>
            <span className="text-rose-400 font-mono">- R$ {ride.totalCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-1 font-black text-base bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <span className="text-emerald-300">Sobrou na sua mão:</span>
            <span className="text-emerald-400 font-mono">R$ {ride.netProfit.toFixed(2)}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-2 text-xs">
          <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px]">
            Detalhes do Trajeto
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Ponto de Embarque</span>
                <span className="text-slate-200 font-semibold">{ride.pickupAddress}</span>
                <span className="text-[11px] text-slate-400 block font-mono">Deslocamento até local: {ride.distancePickupKm} km</span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Destino do Passageiro</span>
                <span className="text-slate-200 font-semibold">{ride.dropoffAddress}</span>
                <span className="text-[11px] text-slate-400 block font-mono">Distância da viagem: {ride.distanceTripKm} km ({ride.durationMinutes} min)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          {onReject && (
            <button
              onClick={() => {
                onReject(ride);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Rejeitar / Pular
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => {
                onAccept(ride);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
            >
              Aceitar Corrida
            </button>
          )}
          {!onAccept && !onReject && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
