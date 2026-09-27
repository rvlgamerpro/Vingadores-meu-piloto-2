import { DriverSettings, Ride, SemaforoStatus, AppSource } from '../types';

export const DEFAULT_SETTINGS: DriverSettings = {
  fuelType: 'gasolina',
  fuelPricePerLiter: 5.95,
  fuelConsumptionKmPerL: 11.2,
  wearCostPerKm: 0.18, // Pneus, óleo sintético, pastilhas, suspensão
  monthlyFixedCosts: {
    seguro: 240,
    ipva: 160,
    planoCelular: 65,
    meiOuTaxas: 75,
    limpeza: 100,
    outros: 120, // Amortização / reserva de emergência
  },
  monthlyWorkingDays: 25,
  dailyWorkingHours: 9,
  estimatedMonthlyKm: 3200,
  minRatePerKmGreen: 2.50,
  minRatePerKmYellow: 2.00,
  minRatePerHourGreen: 45.00,
  minRatePerHourYellow: 35.00,
  minNetProfit: 6.00,
  monitorUber: true,
  monitor99: true,
  monitorInDrive: true,
  autoSpeechAlert: true,
  speechVolume: 1.0,
  autoRejectRed: false,
  overlayTheme: 'dark',
  overlaySize: 'mini',
  overlayPositionDefault: 'top-left',
  overlayOpacity: 0.95,
  overlayShowProfit: true,
  overlayShowKm: true,
  overlaySoundFeedback: true,
  floatingWindowPinned: true,
};

export function calculateFixedCostPerKm(settings: DriverSettings): number {
  const sumFixed = Object.values(settings.monthlyFixedCosts).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const monthlyKm = settings.estimatedMonthlyKm > 0 ? settings.estimatedMonthlyKm : 3000;
  return sumFixed / monthlyKm;
}

export function calculateFuelCostPerKm(settings: DriverSettings): number {
  if (settings.fuelConsumptionKmPerL <= 0) return 0.50;
  return settings.fuelPricePerLiter / settings.fuelConsumptionKmPerL;
}

export function calculateTotalCostPerKm(settings: DriverSettings): number {
  const fuel = calculateFuelCostPerKm(settings);
  const wear = settings.wearCostPerKm || 0;
  const fixed = calculateFixedCostPerKm(settings);
  return fuel + wear + fixed;
}

export function evaluateRide(
  raw: {
    id?: string;
    app: AppSource;
    grossFare: number;
    distancePickupKm: number;
    distanceTripKm: number;
    durationMinutes: number;
    pickupAddress: string;
    dropoffAddress: string;
    passengerName?: string;
    passengerRating?: number;
    category?: string;
  },
  settings: DriverSettings
): Ride {
  const totalKm = Math.max(0.1, Number((raw.distancePickupKm + raw.distanceTripKm).toFixed(1)));
  const duration = Math.max(1, raw.durationMinutes);
  const gross = Number(raw.grossFare.toFixed(2));

  // Custos específicos da corrida
  const fuelCostPerKm = calculateFuelCostPerKm(settings);
  const fixedCostPerKm = calculateFixedCostPerKm(settings);
  const wearPerKm = settings.wearCostPerKm || 0.18;

  const fuelCost = Number((totalKm * fuelCostPerKm).toFixed(2));
  const wearCost = Number((totalKm * wearPerKm).toFixed(2));
  const fixedCostShare = Number((totalKm * fixedCostPerKm).toFixed(2));
  const totalCost = Number((fuelCost + wearCost + fixedCostShare).toFixed(2));

  const netProfit = Number((gross - totalCost).toFixed(2));
  const ratePerKm = Number((gross / totalKm).toFixed(2));
  const ratePerHour = Number(((gross / duration) * 60).toFixed(2));
  const netRatePerKm = Number((netProfit / totalKm).toFixed(2));
  const netRatePerHour = Number(((netProfit / duration) * 60).toFixed(2));

  // Lógica do Semáforo
  let semaforo: SemaforoStatus = 'YELLOW';
  let semaforoReason = '';

  const meetsGreenKm = ratePerKm >= settings.minRatePerKmGreen;
  const meetsGreenHour = ratePerHour >= settings.minRatePerHourGreen;
  const meetsYellowKm = ratePerKm >= settings.minRatePerKmYellow;
  const meetsYellowHour = ratePerHour >= settings.minRatePerHourYellow;
  const hasGoodProfit = netProfit >= settings.minNetProfit;

  if (meetsGreenKm && meetsGreenHour && hasGoodProfit) {
    semaforo = 'GREEN';
    semaforoReason = `Excelente! R$ ${ratePerKm.toFixed(2)}/km e R$ ${ratePerHour.toFixed(0)}/h. Lucro real de R$ ${netProfit.toFixed(2)}.`;
  } else if (ratePerKm < settings.minRatePerKmYellow || netProfit <= 1.0 || (!meetsYellowKm && !meetsYellowHour)) {
    semaforo = 'RED';
    if (ratePerKm < settings.minRatePerKmYellow) {
      semaforoReason = `Não compensa! R$ ${ratePerKm.toFixed(2)}/km está abaixo do mínimo (R$ ${settings.minRatePerKmYellow.toFixed(2)}). Gasto de R$ ${totalCost.toFixed(2)}.`;
    } else if (netProfit <= 1.0) {
      semaforoReason = `Corrida deficitária! Lucro de apenas R$ ${netProfit.toFixed(2)} com custo total de R$ ${totalCost.toFixed(2)}.`;
    } else {
      semaforoReason = `Preço fraco: R$ ${ratePerKm.toFixed(2)}/km e apenas R$ ${ratePerHour.toFixed(0)}/h. Pule!`;
    }
  } else {
    semaforo = 'YELLOW';
    if (!meetsGreenKm && meetsGreenHour) {
      semaforoReason = `Atenção: Bom ganho por hora (R$ ${ratePerHour.toFixed(0)}/h), mas R$ ${ratePerKm.toFixed(2)}/km está no limite moderado.`;
    } else if (meetsGreenKm && !meetsGreenHour) {
      semaforoReason = `Atenção: R$ ${ratePerKm.toFixed(2)}/km é bom, mas trânsito pesado (R$ ${ratePerHour.toFixed(0)}/h).`;
    } else {
      semaforoReason = `Corrida intermediária: R$ ${ratePerKm.toFixed(2)}/km e lucro líquido de R$ ${netProfit.toFixed(2)}.`;
    }
  }

  return {
    id: raw.id || `ride_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    app: raw.app,
    timestamp: new Date().toISOString(),
    passengerName: raw.passengerName || 'Passageiro',
    passengerRating: raw.passengerRating || 4.88,
    category: raw.category || (raw.app === 'uber' ? 'UberX' : raw.app === '99' ? '99Pop' : 'inDrive Conforto'),
    grossFare: gross,
    distancePickupKm: raw.distancePickupKm,
    distanceTripKm: raw.distanceTripKm,
    totalDistanceKm: totalKm,
    durationMinutes: duration,
    pickupAddress: raw.pickupAddress,
    dropoffAddress: raw.dropoffAddress,
    fuelCost,
    wearCost,
    fixedCostShare,
    totalCost,
    netProfit,
    ratePerKm,
    ratePerHour,
    netRatePerKm,
    netRatePerHour,
    semaforo,
    semaforoReason,
    status: 'pending',
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
