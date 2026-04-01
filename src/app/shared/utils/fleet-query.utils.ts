export type FleetQueryStyle = 'fleet' | 'id' | 'both';

export function normalizeFleetId(fleetId?: string | null): string | undefined {
  const value = fleetId?.trim();
  return value ? value : undefined;
}

export function buildFleetQueryParams(
  fleetId?: string | null,
  style: FleetQueryStyle = 'both',
): Record<string, string> {
  const normalizedFleetId = normalizeFleetId(fleetId);
  if (!normalizedFleetId) {
    return {};
  }

  if (style === 'fleet') {
    return { FleetId: normalizedFleetId };
  }

  if (style === 'id') {
    return { IdFleet: normalizedFleetId };
  }

  return {
    FleetId: normalizedFleetId,
    IdFleet: normalizedFleetId,
  };
}
