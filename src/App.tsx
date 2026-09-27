/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Ride, DriverSettings } from './types';
import { DEFAULT_SETTINGS, evaluateRide } from './utils/calculator';
import { PRESET_RIDES } from './utils/mockRides';
import { Header } from './components/Header';
import { MobileSimulator } from './components/MobileSimulator';
import { CopilotDashboard } from './components/Tabs/CopilotDashboard';
import { ProfitCalculator } from './components/Tabs/ProfitCalculator';
import { SemaforoSettings } from './components/Tabs/SemaforoSettings';
import { RidesHistory } from './components/Tabs/RidesHistory';
import { AndroidNativeCode } from './components/Tabs/AndroidNativeCode';
import { RideDetailModal } from './components/RideDetailModal';
import { FloatingOverlaySimulator } from './components/FloatingOverlaySimulator';
import { playAlertBeep, announceRide } from './utils/speech';

export default function App() {
  // Load settings
  const [settings, setSettings] = useState<DriverSettings>(() => {
    try {
      const saved = localStorage.getItem('rv_copiloto_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load rides history (or seed initial realistic day history)
  const [rides, setRides] = useState<Ride[]>(() => {
    try {
      const saved = localStorage.getItem('rv_copiloto_rides');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Initial seed with past rides of the day
    const initialSeed: Ride[] = [
      {
        ...evaluateRide(PRESET_RIDES[0], DEFAULT_SETTINGS),
        status: 'accepted',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        ...evaluateRide(PRESET_RIDES[1], DEFAULT_SETTINGS),
        status: 'accepted',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        ...evaluateRide(PRESET_RIDES[5], DEFAULT_SETTINGS),
        status: 'rejected',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        ...evaluateRide(PRESET_RIDES[2], DEFAULT_SETTINGS),
        status: 'accepted',
        timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      },
      {
        ...evaluateRide(PRESET_RIDES[6], DEFAULT_SETTINGS),
        status: 'rejected',
        timestamp: new Date(Date.now() - 3600000 * 0.3).toISOString(),
      },
    ];
    return initialSeed;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Active simulated incoming ride offer
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  // Selected ride for detail modal
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('rv_copiloto_settings', JSON.stringify(settings));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [settings]);

  // Persist rides
  useEffect(() => {
    try {
      localStorage.setItem('rv_copiloto_rides', JSON.stringify(rides));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [rides]);

  const handleRideTriggered = (ride: Ride) => {
    setActiveRide(ride);
    // Add to history as pending
    setRides((prev) => [ride, ...prev.filter((r) => r.id !== ride.id)]);
  };

  const handleRideAccepted = (ride: Ride) => {
    const updated: Ride = { ...ride, status: 'accepted' };
    setRides((prev) => [updated, ...prev.filter((r) => r.id !== ride.id)]);
    setActiveRide(null);
  };

  const handleRideRejected = (ride: Ride) => {
    const updated: Ride = { ...ride, status: 'rejected' };
    setRides((prev) => [updated, ...prev.filter((r) => r.id !== ride.id)]);
    setActiveRide(null);
  };

  const handleQuickSimulate = (type: 'green' | 'yellow' | 'red') => {
    const presetIndex = type === 'green' ? 0 : type === 'yellow' ? 3 : 5;
    const raw = PRESET_RIDES[presetIndex];
    const ride = evaluateRide(raw, settings);
    handleRideTriggered(ride);
    playAlertBeep(ride.semaforo);
    if (settings.autoSpeechAlert) {
      announceRide(ride, true, settings.speechVolume);
    }
    setActiveTab('simulator');
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico de corridas salvas?')) {
      setRides([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Application Header & Navigation */}
      <Header
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSimulatorTab={() => setActiveTab('simulator')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <CopilotDashboard
            rides={rides}
            settings={settings}
            onSelectRide={setSelectedRide}
            onOpenSimulator={() => setActiveTab('simulator')}
            onOpenNativeCode={() => setActiveTab('native-code')}
            onQuickSimulate={handleQuickSimulate}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Simulador ao Vivo do Celular & Janela Flutuante
              </h2>
              <p className="text-xs text-slate-400">
                Veja exatamente como o Vingadores Copiloto funciona sobre a tela da Uber, 99 e inDrive, lendo os dados e alertando por voz e cores.
              </p>
            </div>

            <MobileSimulator
              settings={settings}
              activeRide={activeRide}
              onRideTriggered={handleRideTriggered}
              onRideAccepted={handleRideAccepted}
              onRideRejected={handleRideRejected}
              onCloseOverlay={() => setActiveRide(null)}
            />
          </div>
        )}

        {activeTab === 'calculator' && (
          <ProfitCalculator settings={settings} onUpdateSettings={setSettings} />
        )}

        {activeTab === 'settings' && (
          <SemaforoSettings settings={settings} onUpdateSettings={setSettings} />
        )}

        {activeTab === 'history' && (
          <RidesHistory
            rides={rides}
            settings={settings}
            onSelectRide={setSelectedRide}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'native-code' && <AndroidNativeCode />}
      </main>

      {/* Detailed Modal Inspection */}
      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          settings={settings}
          onClose={() => setSelectedRide(null)}
          onAccept={handleRideAccepted}
          onReject={handleRideRejected}
        />
      )}

      {/* Driver Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-400">Vingadores Copiloto</span>
            <span>• O Aliado do Motorista de Aplicativo (Uber, 99, inDrive)</span>
          </div>
          <div>
            Arquitetura Nativa: Kotlin + Jetpack Compose • Android 9.0+
          </div>
        </div>
      </footer>
    </div>
  );
}
