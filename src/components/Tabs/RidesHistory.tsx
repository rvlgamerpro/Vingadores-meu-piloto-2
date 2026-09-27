import React, { useState } from 'react';
import { Ride, DriverSettings, AppSource } from '../../types';
import { SemaforoBadge } from '../SemaforoBadge';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  DollarSign, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowUpDown,
  Car
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculator';

interface RidesHistoryProps {
  rides: Ride[];
  settings: DriverSettings;
  onSelectRide: (ride: Ride) => void;
  onClearHistory: () => void;
}

export const RidesHistory: React.FC<RidesHistoryProps> = ({
  rides,
  settings,
  onSelectRide,
  onClearHistory,
}) => {
  const [filterApp, setFilterApp] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSemaforo, setFilterSemaforo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter rides
  const filteredRides = rides.filter((ride) => {
    if (filterApp !== 'all' && ride.app !== filterApp) return false;
    if (filterStatus !== 'all' && ride.status !== filterStatus) return false;
    if (filterSemaforo !== 'all' && ride.semaforo !== filterSemaforo) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ride.pickupAddress.toLowerCase().includes(term) ||
        ride.dropoffAddress.toLowerCase().includes(term) ||
        ride.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculate filtered totals
  const totalGross = filteredRides.reduce((acc, r) => acc + r.grossFare, 0);
  const totalNet = filteredRides.reduce((acc, r) => acc + r.netProfit, 0);
  const totalKm = filteredRides.reduce((acc, r) => acc + r.totalDistanceKm, 0);
  const totalMinutes = filteredRides.reduce((acc, r) => acc + r.durationMinutes, 0);

  const acceptedCount = filteredRides.filter((r) => r.status === 'accepted' || r.status === 'completed').length;
  const rejectedCount = filteredRides.filter((r) => r.status === 'rejected').length;

  const greenCount = filteredRides.filter((r) => r.semaforo === 'GREEN').length;
  const yellowCount = filteredRides.filter((r) => r.semaforo === 'YELLOW').length;
  const redCount = filteredRides.filter((r) => r.semaforo === 'RED').length;

  const uberCount = filteredRides.filter((r) => r.app === 'uber').length;
  const noventaCount = filteredRides.filter((r) => r.app === '99').length;
  const inDriveCount = filteredRides.filter((r) => r.app === 'indrive').length;

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRides.length === 0) return;
    const headers = [
      'ID',
      'App',
      'Data/Hora',
      'Categoria',
      'Valor Bruto (R$)',
      'Total Km',
      'Tempo (min)',
      'Custo Total (R$)',
      'Lucro Liquido (R$)',
      'R$/Km',
      'R$/Hora',
      'Semaforo',
      'Status',
      'Embarque',
      'Destino',
    ];

    const rows = filteredRides.map((r) => [
      r.id,
      r.app.toUpperCase(),
      new Date(r.timestamp).toLocaleString('pt-BR'),
      r.category,
      r.grossFare.toFixed(2),
      r.totalDistanceKm.toFixed(1),
      r.durationMinutes,
      r.totalCost.toFixed(2),
      r.netProfit.toFixed(2),
      r.ratePerKm.toFixed(2),
      r.ratePerHour.toFixed(2),
      r.semaforo,
      r.status,
      `"${r.pickupAddress.replace(/"/g, '""')}"`,
      `"${r.dropoffAddress.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vingadores_copiloto_historico_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Histórico de Corridas & Relatórios
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Todas as corridas interceptadas pelo leitor de acessibilidade ficam salvas localmente para controle de ganhos e auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredRides.length === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={rides.length === 0}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Lucro Líquido Real
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalNet)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Bruto: {formatCurrency(totalGross)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Km & Horas
          </span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {totalKm.toFixed(1)} km
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m em trânsito
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Média por Km
          </span>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {totalKm > 0 ? formatCurrency(totalGross / totalKm) : 'R$ 0,00'}/km
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">
            Líq: {totalKm > 0 ? formatCurrency(totalNet / totalKm) : 'R$ 0,00'}/km
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Taxa de Aceite
          </span>
          <span className="text-2xl font-black text-purple-300 font-mono">
            {filteredRides.length > 0 ? `${Math.round((acceptedCount / filteredRides.length) * 100)}%` : '0%'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {acceptedCount} aceitas / {rejectedCount} puladas
          </span>
        </div>
      </div>

      {/* Visual Analytics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Semáforo Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Distribuição do Semáforo
          </span>
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${filteredRides.length > 0 ? (greenCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Verde: ${greenCount}`}
            />
            <div
              style={{ width: `${filteredRides.length > 0 ? (yellowCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Amarelo: ${yellowCount}`}
            />
            <div
              style={{ width: `${filteredRides.length > 0 ? (redCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Vermelho: ${redCount}`}
            />
          </div>

          <div className="flex justify-between text-xs font-bold pt-1">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Verde: {greenCount}
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Amarelo: {yellowCount}
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              Vermelho: {redCount}
            </span>
          </div>
        </div>

        {/* App Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Corridas por Aplicativo
          </span>
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${filteredRides.length > 0 ? (uberCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-zinc-300 transition-all duration-500"
            />
            <div
              style={{ width: `${filteredRides.length > 0 ? (noventaCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-amber-500 transition-all duration-500"
            />
            <div
              style={{ width: `${filteredRides.length > 0 ? (inDriveCount / filteredRides.length) * 100 : 0}%` }}
              className="bg-emerald-600 transition-all duration-500"
            />
          </div>

          <div className="flex justify-between text-xs font-bold pt-1">
            <span className="text-zinc-200">Uber: {uberCount}</span>
            <span className="text-amber-400">99: {noventaCount}</span>
            <span className="text-emerald-400">inDrive: {inDriveCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por endereço ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* App filter */}
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold cursor-pointer"
          >
            <option value="all">Todos os Apps</option>
            <option value="uber">Apenas Uber</option>
            <option value="99">Apenas 99</option>
            <option value="indrive">Apenas inDrive</option>
          </select>

          {/* Semáforo filter */}
          <select
            value={filterSemaforo}
            onChange={(e) => setFilterSemaforo(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold cursor-pointer"
          >
            <option value="all">Todos os Semáforos</option>
            <option value="GREEN">🟢 Apenas Verdes</option>
            <option value="YELLOW">🟡 Apenas Amarelos</option>
            <option value="RED">🔴 Apenas Vermelhos</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold cursor-pointer"
          >
            <option value="all">Aceitas & Puladas</option>
            <option value="accepted">Apenas Aceitas</option>
            <option value="rejected">Apenas Puladas</option>
          </select>
        </div>
      </div>

      {/* Rides List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredRides.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <Car className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
            <p className="text-sm font-bold text-slate-400">Nenhuma corrida encontrada</p>
            <p className="text-xs">Altere os filtros acima ou dispare corridas no simulador.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredRides.map((ride) => (
              <div
                key={ride.id}
                onClick={() => onSelectRide(ride)}
                className="p-4 hover:bg-slate-800/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider shrink-0 ${
                    ride.app === 'uber' ? 'bg-black text-white border border-zinc-700' :
                    ride.app === '99' ? 'bg-amber-500 text-black font-extrabold' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {ride.app}
                  </span>

                  <SemaforoBadge status={ride.semaforo} size="sm" />

                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{ride.category}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        • {new Date(ride.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 truncate max-w-sm sm:max-w-md">
                      {ride.pickupAddress}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-sm sm:max-w-md">
                      Destino: {ride.dropoffAddress}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/60 pt-2 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-slate-400 font-mono">
                      {ride.totalDistanceKm} km • {ride.durationMinutes} min
                    </div>
                    <div className="text-xs font-bold text-slate-300 font-mono">
                      R$ {ride.ratePerKm.toFixed(2)}/km
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-bold">Bruto</div>
                    <div className="text-sm font-black text-white font-mono">
                      R$ {ride.grossFare.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-bold">Lucro Líq.</div>
                    <div className={`text-base font-black font-mono ${
                      ride.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      R$ {ride.netProfit.toFixed(2)}
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    ride.status === 'accepted' || ride.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {ride.status === 'accepted' || ride.status === 'completed' ? 'Aceita' : 'Pulada'}
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
