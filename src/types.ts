export type AppSource = 'uber' | '99' | 'indrive';

export type SemaforoStatus = 'GREEN' | 'YELLOW' | 'RED';

export type RideStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Ride {
  id: string;
  app: AppSource;
  timestamp: string; // ISO string
  passengerName?: string;
  passengerRating?: number;
  category: string; // ex: 'UberX', 'Uber Comfort', '99Pop', '99Plus', 'inDrive'
  grossFare: number; // R$ bruto
  distancePickupKm: number; // km até o passageiro
  distanceTripKm: number; // km da corrida
  totalDistanceKm: number; // total km
  durationMinutes: number; // tempo estimado em minutos
  pickupAddress: string;
  dropoffAddress: string;
  
  // Cálculos financeiros automáticos
  fuelCost: number; // custo estimado de combustível
  wearCost: number; // custo estimado de desgaste (pneus, óleo, freios)
  fixedCostShare: number; // rateio de custo fixo por km
  totalCost: number; // custos somados
  netProfit: number; // lucro líquido real (grossFare - totalCost)
  ratePerKm: number; // R$ bruto por km
  ratePerHour: number; // R$ bruto por hora projetado
  netRatePerKm: number; // R$ líquido por km
  netRatePerHour: number; // R$ líquido por hora projetado
  
  // Veredito do Semáforo
  semaforo: SemaforoStatus;
  semaforoReason: string;
  status: RideStatus;
}

export interface MonthlyFixedCosts {
  seguro: number; // Seguro / Associação veicular
  ipva: number; // IPVA / Licenciamento anual amortizado
  planoCelular: number; // Plano de dados / suporte
  meiOuTaxas: number; // MEI / Taxas sindicais
  limpeza: number; // Lavagem e higienização mensal
  outros: number; // Aluguel do carro ou outras despesas
}

export interface DriverSettings {
  // Dados do veículo e combustível
  fuelType: 'gasolina' | 'etanol' | 'gnv' | 'diesel' | 'eletrico';
  fuelPricePerLiter: number; // Preço do litro (ou m³ de GNV, ou kWh)
  fuelConsumptionKmPerL: number; // Consumo médio (km/l ou km/m³)
  wearCostPerKm: number; // R$ por km para desgaste (óleo, pneu, pastilha) - média R$ 0.18/km
  
  // Custos fixos
  monthlyFixedCosts: MonthlyFixedCosts;
  monthlyWorkingDays: number; // Ex: 25 dias
  dailyWorkingHours: number; // Ex: 9 horas
  estimatedMonthlyKm: number; // Ex: 3500 km
  
  // Parâmetros do Semáforo
  minRatePerKmGreen: number; // Mínimo para Verde (ex: R$ 2,50)
  minRatePerKmYellow: number; // Mínimo para Amarelo (ex: R$ 2,00 - abaixo disso é Vermelho)
  minRatePerHourGreen: number; // Mínimo por hora Verde (ex: R$ 45,00)
  minRatePerHourYellow: number; // Mínimo por hora Amarelo (ex: R$ 35,00)
  minNetProfit: number; // Lucro líquido mínimo aceitável (ex: R$ 6,00)
  
  // Aplicativos monitorados
  monitorUber: boolean;
  monitor99: boolean;
  monitorInDrive: boolean;
  
  // Preferências do copiloto e opções de tela
  autoSpeechAlert: boolean; // Fala por voz o valor e semáforo
  speechVolume: number; // 0 a 1
  autoRejectRed: boolean; // Alerta insistente ou sugestão de pular
  overlayTheme: 'dark' | 'high-contrast' | 'amoled';
  overlaySize: 'mini' | 'compact' | 'normal'; // mini = ultra-compacto reduzido pela metade
  overlayPositionDefault: 'top-left' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-right';
  overlayOpacity: number; // 0.7 a 1.0
  overlayShowProfit: boolean; // Exibir lucro líquido no mini popup
  overlayShowKm: boolean; // Exibir km no mini popup
  overlaySoundFeedback: boolean; // Tocar beeps nas cores
  floatingWindowPinned: boolean;
}

export interface DaySummary {
  date: string;
  totalGross: number;
  totalNet: number;
  totalFuelCost: number;
  totalWearCost: number;
  totalRidesAccepted: number;
  totalRidesRejected: number;
  totalDistanceKm: number;
  totalMinutes: number;
  avgRatePerKm: number;
  avgRatePerHour: number;
}
