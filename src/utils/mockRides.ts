import { AppSource } from '../types';

export interface RawRideOffer {
  app: AppSource;
  category: string;
  grossFare: number;
  distancePickupKm: number;
  distanceTripKm: number;
  durationMinutes: number;
  pickupAddress: string;
  dropoffAddress: string;
  passengerName: string;
  passengerRating: number;
}

export const PRESET_RIDES: RawRideOffer[] = [
  // 🟢 Green rides
  {
    app: 'uber',
    category: 'Uber Comfort',
    grossFare: 42.80,
    distancePickupKm: 1.2,
    distanceTripKm: 10.5,
    durationMinutes: 24,
    pickupAddress: 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi',
    dropoffAddress: 'Aeroporto de Congonhas (CGH) - Embarque',
    passengerName: 'Camila Rossi',
    passengerRating: 4.96,
  },
  {
    app: '99',
    category: '99Pop Dinâmico',
    grossFare: 29.50,
    distancePickupKm: 0.8,
    distanceTripKm: 6.2,
    durationMinutes: 18,
    pickupAddress: 'Rua Augusta, 1492 - Consolação',
    dropoffAddress: 'Av. Rebouças, 3970 - Pinheiros',
    passengerName: 'Lucas Ferreira',
    passengerRating: 4.91,
  },
  {
    app: 'indrive',
    category: 'inDrive Oferta Direta',
    grossFare: 55.00,
    distancePickupKm: 1.5,
    distanceTripKm: 13.8,
    durationMinutes: 30,
    pickupAddress: 'Shopping Morumbi - Av. Roque Petroni Jr.',
    dropoffAddress: 'Parque Ibirapuera - Portão 3',
    passengerName: 'Marcos Vinicius',
    passengerRating: 4.88,
  },
  // 🟡 Yellow rides
  {
    app: 'uber',
    category: 'UberX',
    grossFare: 22.40,
    distancePickupKm: 2.5,
    distanceTripKm: 8.5,
    durationMinutes: 28,
    pickupAddress: 'Rua Domingos de Morais, 2100 - Vila Mariana',
    dropoffAddress: 'Rua Vergueiro, 3185 - Chácara Klabin',
    passengerName: 'Fernanda Lima',
    passengerRating: 4.82,
  },
  {
    app: '99',
    category: '99Pop',
    grossFare: 17.80,
    distancePickupKm: 1.6,
    distanceTripKm: 6.9,
    durationMinutes: 22,
    pickupAddress: 'Metrô Santa Cruz - R. Domingos de Morais',
    dropoffAddress: 'Av. Jabaquara, 1500 - Mirandópolis',
    passengerName: 'Rafael Souza',
    passengerRating: 4.79,
  },
  // 🔴 Red rides (traps / low profit)
  {
    app: 'uber',
    category: 'UberX Promo',
    grossFare: 11.20,
    distancePickupKm: 3.8,
    distanceTripKm: 4.5,
    durationMinutes: 23,
    pickupAddress: 'Estrada do Campo Limpo, 1200',
    dropoffAddress: 'Rua Francisco de Holanda, 85',
    passengerName: 'Gabriel Santos',
    passengerRating: 4.65,
  },
  {
    app: '99',
    category: '99Pop',
    grossFare: 18.50,
    distancePickupKm: 4.2,
    distanceTripKm: 12.0,
    durationMinutes: 42,
    pickupAddress: 'Av. Interlagos, 2255 - Zona Sul',
    dropoffAddress: 'Av. Santo Amaro, 4500 - Santo Amaro',
    passengerName: 'Juliana Paes',
    passengerRating: 4.70,
  },
  {
    app: 'indrive',
    category: 'inDrive Baixa Oferta',
    grossFare: 15.00,
    distancePickupKm: 2.8,
    distanceTripKm: 9.6,
    durationMinutes: 32,
    pickupAddress: 'Rodovia Raposo Tavares km 16',
    dropoffAddress: 'Butantã - Rua Alvarenga',
    passengerName: 'Carlos Eduardo',
    passengerRating: 4.55,
  },
];
