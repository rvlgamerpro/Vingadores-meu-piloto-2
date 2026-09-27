import React, { useState } from 'react';
import { DriverSettings } from '../../types';
import { 
  Fuel, 
  Wrench, 
  Car, 
  Calendar, 
  Clock, 
  HelpCircle, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { 
  calculateFuelCostPerKm, 
  calculateFixedCostPerKm, 
  calculateTotalCostPerKm, 
  formatCurrency 
} from '../../utils/calculator';

interface ProfitCalculatorProps {
  settings: DriverSettings;
  onUpdateSettings: (newSettings: DriverSettings) => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState<DriverSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fuelCostPerKm = calculateFuelCostPerKm(form);
  const fixedCostPerKm = calculateFixedCostPerKm(form);
  const wearPerKm = form.wearCostPerKm || 0.18;
  const totalCostPerKm = fuelCostPerKm + wearPerKm + fixedCostPerKm;

  // Monthly fixed total
  const totalMonthlyFixed = Object.values(form.monthlyFixedCosts).reduce(
    (acc, v) => acc + (Number(v) || 0),
    0
  );

  const totalMonthlyCostEstimated =
    totalMonthlyFixed + (form.estimatedMonthlyKm * (fuelCostPerKm + wearPerKm));

  const costPerHour =
    form.monthlyWorkingDays > 0 && form.dailyWorkingHours > 0
      ? totalMonthlyCostEstimated / (form.monthlyWorkingDays * form.dailyWorkingHours)
      : 0;

  const handleSave = () => {
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFixedCostChange = (key: keyof typeof form.monthlyFixedCosts, val: number) => {
    setForm({
      ...form,
      monthlyFixedCosts: {
        ...form.monthlyFixedCosts,
        [key]: Math.max(0, val),
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Cálculo de Custos & Lucro Líquido Real
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Insira seus dados reais para o Vingadores Copiloto calcular com precisão cirúrgica quanto sobra no seu bolso em cada chamada recebida da Uber, 99 e inDrive.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer self-start md:self-auto"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Salvar Custos no Copiloto</span>
              </>
            )}
          </button>
        </div>

        {/* Real Cost Per Km Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Custo de Combustível / Km
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(fuelCostPerKm)}
              <span className="text-xs font-normal text-slate-400">/km</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {form.fuelConsumptionKmPerL} km/L @ {formatCurrency(form.fuelPricePerLiter)}/L
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Desgaste Mecânico / Km
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {formatCurrency(wearPerKm)}
              <span className="text-xs font-normal text-slate-400">/km</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Pneus, troca de óleo, freios
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Custos Fixos Rateados / Km
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
              {formatCurrency(fixedCostPerKm)}
              <span className="text-xs font-normal text-slate-400">/km</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Seguro, IPVA, MEI amortizados
            </span>
          </div>

          <div className="bg-gradient-to-br from-rose-950/50 to-slate-950 border-2 border-rose-500/40 rounded-2xl p-4">
            <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider block">
              CUSTO TOTAL REAL POR KM
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {formatCurrency(totalCostPerKm)}
              <span className="text-xs font-normal text-rose-300">/km</span>
            </span>
            <span className="text-[10px] text-rose-300/80 block mt-0.5 font-bold">
              Qualquer corrida abaixo disso dá prejuízo!
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Combustível e Consumo */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Fuel className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">1. Combustível & Veículo</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tipo de Combustível */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Tipo de Combustível</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['gasolina', 'etanol', 'gnv', 'diesel', 'eletrico'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const defaultPrices = {
                        gasolina: 5.95,
                        etanol: 3.99,
                        gnv: 4.49,
                        diesel: 5.80,
                        eletrico: 0.90,
                      };
                      setForm({
                        ...form,
                        fuelType: type,
                        fuelPricePerLiter: defaultPrices[type],
                      });
                    }}
                    className={`py-2 px-2 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer ${
                      form.fuelType === type
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Preço do Litro / Unidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Preço do Litro (ou m³ de GNV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.fuelPricePerLiter}
                    onChange={(e) => setForm({ ...form, fuelPricePerLiter: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Consumo Médio (Km por Litro)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={form.fuelConsumptionKmPerL}
                    onChange={(e) => setForm({ ...form, fuelConsumptionKmPerL: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs">km/L</span>
                </div>
              </div>
            </div>

            {/* Desgaste Amortizado por Km */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold">
                  Reserva para Desgaste Mecânico / Km
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  R$ {form.wearCostPerKm.toFixed(2)}/km
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={form.wearCostPerKm}
                onChange={(e) => setForm({ ...form, wearCostPerKm: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>R$ 0,05 (Carro novo)</span>
                <span>R$ 0,18 (Recomendado)</span>
                <span>R$ 0,40 (Carro pesado/antigo)</span>
              </div>
            </div>

            {/* Rotina de Trabalho */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sua Jornada de Trabalho Estimada
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 text-[11px] block">Dias no Mês</label>
                  <input
                    type="number"
                    value={form.monthlyWorkingDays}
                    onChange={(e) => setForm({ ...form, monthlyWorkingDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Horas / Dia</label>
                  <input
                    type="number"
                    value={form.dailyWorkingHours}
                    onChange={(e) => setForm({ ...form, dailyWorkingHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Km Mês (Total)</label>
                  <input
                    type="number"
                    value={form.estimatedMonthlyKm}
                    onChange={(e) => setForm({ ...form, estimatedMonthlyKm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Custos Fixos Mensais */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-base text-white">2. Custos Fixos Mensais</h3>
            </div>
            <span className="text-xs font-mono font-black text-purple-400">
              Total: {formatCurrency(totalMonthlyFixed)}/mês
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Estes custos ocorrem todo mês quer você rode ou não. O Vingadores Copiloto rateia cada centavo por quilômetro rodado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Seguro / Proteção Veicular (R$/mês)
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.seguro}
                onChange={(e) => handleFixedCostChange('seguro', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                IPVA + Licenciamento (mês)
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.ipva}
                onChange={(e) => handleFixedCostChange('ipva', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Plano de Celular & Dados
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.planoCelular}
                onChange={(e) => handleFixedCostChange('planoCelular', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                MEI / DAS ou Taxas
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.meiOuTaxas}
                onChange={(e) => handleFixedCostChange('meiOuTaxas', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Lavagens e Higienização
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.limpeza}
                onChange={(e) => handleFixedCostChange('limpeza', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Aluguel do Carro / Outros
              </label>
              <input
                type="number"
                value={form.monthlyFixedCosts.outros}
                onChange={(e) => handleFixedCostChange('outros', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Operational Cost Per Hour */}
          <div className="mt-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Custo Operacional por Hora Trabalhada:
            </span>
            <span className="text-base font-black font-mono text-purple-400">
              {formatCurrency(costPerHour)}/hora
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
