import { create } from 'zustand';
import type { Flight, FlightStatus, Terminal } from '@/types';

export type SortField = 'departureTime' | 'status' | 'terminal';
type SortDir = 'asc' | 'desc';

interface SortState {
  field: SortField;
  dir: SortDir;
}

const STATUS_ORDER: Record<FlightStatus, number> = {
  'Boarding': 0,
  'On Time': 1,
  'Delayed': 2,
  'Departed': 3,
  'Cancelled': 4,
};

interface FiltersState {
  terminal: Terminal | 'All';
  airline: string;
  status: FlightStatus | 'All';
  destination: string;
}

interface FlightsStore {
  flights: Flight[];
  filters: FiltersState;
  sort: SortState | null;
  setFlights: (flights: Flight[]) => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  setSort: (field: SortField) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;
  addFlight: (flight: Flight) => void;
  removeFlight: (id: string) => void;
  resetFlights: (flights: Flight[]) => void;
}

export const useFlightsStore = create<FlightsStore>((set) => ({
  flights: [],
  filters: {
    terminal: 'All',
    airline: 'All',
    status: 'All',
    destination: '',
  },
  sort: null,

  setFlights: (flights) => set({ flights }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setSort: (field) =>
    set((state) => {
      if (state.sort?.field === field) {
        if (state.sort.dir === 'asc') return { sort: { field, dir: 'desc' } };
        return { sort: null };
      }
      return { sort: { field, dir: 'asc' } };
    }),

  updateFlight: (id, updates) =>
    set((state) => ({
      flights: state.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  addFlight: (flight) => set((state) => ({ flights: [...state.flights, flight] })),

  removeFlight: (id) =>
    set((state) => ({ flights: state.flights.filter((f) => f.id !== id) })),

  resetFlights: (flights) => set({ flights }),
}));

export function selectFilteredFlights(state: FlightsStore): Flight[] {
  const { flights, filters, sort } = state;
  const filtered = flights.filter((f) => {
    if (filters.terminal !== 'All' && f.terminal !== filters.terminal) return false;
    if (filters.airline !== 'All' && f.airline !== filters.airline) return false;
    if (filters.status !== 'All' && f.status !== filters.status) return false;
    if (filters.destination && !f.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    return true;
  });

  if (!sort) return filtered;

  return [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sort.field === 'departureTime') {
      cmp = a.departureTime.localeCompare(b.departureTime);
    } else if (sort.field === 'terminal') {
      cmp = a.terminal.localeCompare(b.terminal);
    } else {
      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    return sort.dir === 'asc' ? cmp : -cmp;
  });
}
