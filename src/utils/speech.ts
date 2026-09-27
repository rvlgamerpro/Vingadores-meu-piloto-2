import { Ride } from '../types';

export function announceRide(ride: Ride, enabled = true, volume = 1.0) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // cancel previous speech if any

    const semaforoWord =
      ride.semaforo === 'GREEN'
        ? 'Verde! Vale a pena.'
        : ride.semaforo === 'YELLOW'
        ? 'Amarelo. Atenção.'
        : 'Vermelho! Não compensa.';

    const appName = ride.app === 'uber' ? 'Uber' : ride.app === '99' ? 'Noventa e Nove' : 'inDrive';

    const text = `${appName}, ${semaforoWord} R$ ${ride.grossFare.toFixed(2).replace('.', ',')}. Ganho de R$ ${ride.ratePerKm.toFixed(2).replace('.', ',')} por quilômetro. Lucro líquido ${ride.netProfit.toFixed(2).replace('.', ',')} reais.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.15; // slightly faster for quick decision
    utterance.pitch = 1.0;
    utterance.volume = Math.max(0.1, Math.min(1.0, volume));

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function playAlertBeep(semaforo: 'GREEN' | 'YELLOW' | 'RED') {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (semaforo === 'GREEN') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5 (pleasant chime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (semaforo === 'YELLOW') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.3); // low buzz
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    }
  } catch {
    // audio context blocked by browser policy until user interaction
  }
}
