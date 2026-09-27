import React, { useState } from 'react';
import { DriverSettings } from '../../types';
import { SemaforoBadge } from '../SemaforoBadge';
import { 
  Sliders, 
  Zap, 
  Volume2, 
  VolumeX, 
  Check, 
  Smartphone, 
  Eye, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Move,
  Monitor,
  Palette,
  Maximize2,
  Minimize2,
  DollarSign,
  Navigation
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculator';

interface SemaforoSettingsProps {
  settings: DriverSettings;
  onUpdateSettings: (newSettings: DriverSettings) => void;
}

export const SemaforoSettings: React.FC<SemaforoSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState<DriverSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Configurações do Semáforo & Opções de Tela
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Personalize as regras financeiras do Semáforo, a posição e tamanho do popup flutuante na tela do celular e os alertas de voz.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Configurações Salvas!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>

      {/* NOVO BLOCO DESTAQUE: OPÇÕES DE TELA & POPUP FLUTUANTE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">
              Opções de Tela & Janela Flutuante (Popup)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Posição Personalizável
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* 1. Tamanho do Popup */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block">
              Tamanho do Popup na Tela
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, overlaySize: 'mini' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  form.overlaySize === 'mini'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Minimize2 className="w-4 h-4 mx-auto mb-1" />
                <span className="block text-[11px]">Micro (50%)</span>
                <span className="text-[9px] opacity-75">~70px</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, overlaySize: 'compact' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  form.overlaySize === 'compact'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4 mx-auto mb-1" />
                <span className="block text-[11px]">Compacto</span>
                <span className="text-[9px] opacity-75">~115px</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, overlaySize: 'normal' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  form.overlaySize === 'normal'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-4 h-4 mx-auto mb-1" />
                <span className="block text-[11px]">Expandido</span>
                <span className="text-[9px] opacity-75">~180px</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              O modo <strong>Mini (50%)</strong> ocupa apenas um pequeno canto, deixando quase toda a tela livre para o GPS da Uber e 99.
            </p>
          </div>

          {/* 2. Posição Padrão Preferida na Tela */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block flex items-center justify-between">
              <span>Posição Padrão Inicial</span>
              <Move className="w-3.5 h-3.5 text-cyan-400" />
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              {[
                { id: 'top-left', label: '↖ Esq Sup' },
                { id: 'top-right', label: '↗ Dir Sup' },
                { id: 'middle-left', label: '← Meio Esq' },
                { id: 'middle-right', label: '→ Meio Dir' },
                { id: 'bottom-left', label: '↙ Esq Inf' },
                { id: 'bottom-right', label: '↘ Dir Inf' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setForm({ ...form, overlayPositionDefault: pos.id as any })}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    form.overlayPositionDefault === pos.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              Você também pode <strong>arrastar livremente</strong> com o dedo para qualquer lugar durante a corrida.
            </p>
          </div>

          {/* 3. Tema Visual e Opacidade */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                Tema Visual do Popup
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'dark', label: 'Dark Pro' },
                  { id: 'amoled', label: 'AMOLED Black' },
                  { id: 'high-contrast', label: 'Alto Contraste' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setForm({ ...form, overlayTheme: th.id as any })}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      form.overlayTheme === th.id
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-bold text-[11px]">Opacidade do Popup</label>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round((form.overlayOpacity || 0.95) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.0"
                step="0.05"
                value={form.overlayOpacity || 0.95}
                onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Toggles extras de exibição na tela */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Exibir Lucro Líquido no Mini
            </span>
            <input
              type="checkbox"
              checked={form.overlayShowProfit ?? true}
              onChange={(e) => setForm({ ...form, overlayShowProfit: e.target.checked })}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              Exibir Km e Distância no Mini
            </span>
            <input
              type="checkbox"
              checked={form.overlayShowKm ?? true}
              onChange={(e) => setForm({ ...form, overlayShowKm: e.target.checked })}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Beep Sonoro por Cor
            </span>
            <input
              type="checkbox"
              checked={form.overlaySoundFeedback ?? true}
              onChange={(e) => setForm({ ...form, overlaySoundFeedback: e.target.checked })}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Limites do Semáforo */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">
              Regras do Semáforo de Corridas
            </h3>
          </div>

          {/* Visual Legend Preview */}
          <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <SemaforoBadge status="GREEN" size="sm" />
              <span className="text-slate-300 font-mono font-bold">
                ≥ {formatCurrency(form.minRatePerKmGreen)}/km & ≥ {formatCurrency(form.minRatePerHourGreen)}/h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <SemaforoBadge status="YELLOW" size="sm" />
              <span className="text-slate-300 font-mono font-bold">
                ≥ {formatCurrency(form.minRatePerKmYellow)}/km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <SemaforoBadge status="RED" size="sm" />
              <span className="text-slate-400 font-mono">
                Abaixo de {formatCurrency(form.minRatePerKmYellow)}/km (Prejuízo)
              </span>
            </div>
          </div>

          {/* Valor Mínimo por Km para Verde */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Meta R$ / Km para Semáforo VERDE
              </label>
              <span className="font-mono text-emerald-400 font-black text-sm">
                R$ {form.minRatePerKmGreen.toFixed(2)}/km
              </span>
            </div>
            <input
              type="range"
              min="1.50"
              max="5.00"
              step="0.10"
              value={form.minRatePerKmGreen}
              onChange={(e) => setForm({ ...form, minRatePerKmGreen: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Padrão recomendado: R$ 2,50 a R$ 3,00 por km total (busca + viagem).
            </span>
          </div>

          {/* Valor Mínimo por Km para Amarelo (limiar vermelho) */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Limite Mínimo para Amarelo (Abaixo disso = VERMELHO)
              </label>
              <span className="font-mono text-amber-400 font-black text-sm">
                R$ {form.minRatePerKmYellow.toFixed(2)}/km
              </span>
            </div>
            <input
              type="range"
              min="1.00"
              max="3.50"
              step="0.10"
              value={form.minRatePerKmYellow}
              onChange={(e) => setForm({ ...form, minRatePerKmYellow: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-rose-400 block font-semibold">
              Corridas abaixo de R$ {form.minRatePerKmYellow.toFixed(2)}/km acionam alerta VERMELHO para pular!
            </span>
          </div>

          {/* Meta por Hora */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                R$ / Hora Verde
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  value={form.minRatePerHourGreen}
                  onChange={(e) => setForm({ ...form, minRatePerHourGreen: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">/h</span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Lucro Mínimo (R$)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={form.minNetProfit}
                  onChange={(e) => setForm({ ...form, minNetProfit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">R$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Aplicativos Monitorados & Assistente de Voz */}
        <div className="space-y-6">
          {/* Apps Monitored */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base text-white">
                Aplicativos Monitorados
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Escolha quais aplicativos o leitor de Acessibilidade deve interceptar automaticamente em segundo plano:
            </p>

            <div className="space-y-3">
              {/* Uber */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-xs border border-zinc-700">
                    U
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Uber Driver</div>
                    <div className="text-[10px] text-slate-400">UberX, Comfort, Black, Flash</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.monitorUber}
                  onChange={(e) => setForm({ ...form, monitorUber: e.target.checked })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              {/* 99 */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black font-black flex items-center justify-center text-xs">
                    99
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">99 Motorista</div>
                    <div className="text-[10px] text-slate-400">99Pop, 99Plus, 99Negocia</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.monitor99}
                  onChange={(e) => setForm({ ...form, monitor99: e.target.checked })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              {/* inDrive */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                    in
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">inDrive Motorista</div>
                    <div className="text-[10px] text-slate-400">Negociação direta de passageiros</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.monitorInDrive}
                  onChange={(e) => setForm({ ...form, monitorInDrive: e.target.checked })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Voice Assistant Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base text-white">
                Voz & Alertas Sonoros
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-bold text-white">Anunciar Análise por Voz</div>
                  <div className="text-[10px] text-slate-400">
                    O copiloto fala em português: &ldquo;Uber, Verde! R$ 28,00, R$ 3,10 por km&rdquo;
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.autoSpeechAlert}
                  onChange={(e) => setForm({ ...form, autoSpeechAlert: e.target.checked })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-bold">Volume da Voz do Copiloto</label>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(form.speechVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={form.speechVolume}
                  onChange={(e) => setForm({ ...form, speechVolume: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
