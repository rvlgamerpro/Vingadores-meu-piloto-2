import React from 'react';
import { DriverSettings } from '../types';
import { 
  Radar, 
  Volume2, 
  VolumeX, 
  Layers, 
  Smartphone, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Flame,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  settings: DriverSettings;
  onUpdateSettings: (newSettings: DriverSettings) => void;
  onOpenSimulatorTab: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSimulatorTab,
  activeTab,
  onTabChange,
}) => {
  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      autoSpeechAlert: !settings.autoSpeechAlert,
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Radar className="w-6 h-6 text-emerald-400 animate-spin-slow" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>VINGADORES</span>
                <span className="text-emerald-400">COPILOTO</span>
              </h1>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Semáforo & Lucro Líquido para Uber, 99 e inDrive
            </p>
          </div>
        </div>

        {/* Live Service Status Badges */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Accessibility Service Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Acessibilidade:</span>
            <span className="text-emerald-400 font-bold">ATIVA</span>
          </div>

          {/* Floating Overlay Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Janela Flutuante:</span>
            <span className="text-cyan-400 font-bold">PRONTA</span>
          </div>

          {/* Monitored apps */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400 px-1">LENDO:</span>
            {settings.monitorUber && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-zinc-800 text-zinc-100">
                UBER
              </span>
            )}
            {settings.monitor99 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-black">
                99
              </span>
            )}
            {settings.monitorInDrive && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-600 text-white">
                INDRIVE
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Assistant Toggle */}
          <button
            onClick={toggleSound}
            title={settings.autoSpeechAlert ? 'Voz ativa (clique para silenciar)' : 'Voz desativada (clique para ativar)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              settings.autoSpeechAlert
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {settings.autoSpeechAlert ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden md:inline">Voz Ativa</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden md:inline">Mudo</span>
              </>
            )}
          </button>

          {/* Simulator quick button */}
          <button
            onClick={onOpenSimulatorTab}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulador Celular</span>
          </button>

          {/* Direct Gerar APK Button in Header */}
          <button
            onClick={() => onTabChange('native-code')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              activeTab === 'native-code'
                ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/40 ring-2 ring-emerald-400'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gerar APK</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2">
          {/* Gerar APK em Primeiro / Destaque para Celular */}
          <TabButton
            active={activeTab === 'native-code'}
            onClick={() => onTabChange('native-code')}
            label="📲 GERAR APK ANDROID"
            icon={ShieldCheck}
            badge="Baixar .ZIP / APK"
            highlight={true}
          />
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
            label="Painel do Copiloto"
            icon={Radar}
          />
          <TabButton
            active={activeTab === 'simulator'}
            onClick={() => onTabChange('simulator')}
            label="Simulador ao Vivo"
            icon={Smartphone}
            badge="Interativo"
          />
          <TabButton
            active={activeTab === 'calculator'}
            onClick={() => onTabChange('calculator')}
            label="Custos & Lucro Líquido"
            icon={Flame}
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
            label="Configurações & Tela"
            icon={Sliders}
            badge="Personalizar"
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => onTabChange('history')}
            label="Histórico & Relatórios"
            icon={Layers}
          />
        </div>
      </div>
    </header>
  );
};

function TabButton({
  active,
  onClick,
  label,
  icon: Icon,
  badge,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
        active
          ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
          : highlight
          ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
      }`}
    >
      <Icon className={`w-4 h-4 ${active || highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
          highlight 
            ? 'bg-emerald-400 text-slate-950 font-black' 
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
