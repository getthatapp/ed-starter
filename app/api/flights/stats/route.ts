import { NextResponse } from 'next/server';
import { readFlights } from '@/lib/flights';
import { ALL_STATUSES } from '@/types';
import type { FlightStatus } from '@/types';

export async function GET() {
  const flights = readFlights();

  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<FlightStatus, number>;
  for (const flight of flights) {
    counts[flight.status]++;
  }

  return NextResponse.json(counts);
}