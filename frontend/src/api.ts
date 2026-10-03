import { Centre, Camera, ComplianceEvent, AnalyticsOverview, AuditLog, InventoryItem } from './types';

const BASE_URL = '/api';

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${BASE_URL}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchCentres(): Promise<Centre[]> {
  const res = await fetch(`${BASE_URL}/centres`);
  if (!res.ok) throw new Error('Failed to fetch centres');
  return res.json();
}

export async function fetchCentreDetail(centreId: string): Promise<{
  centre: Centre;
  rooms: any[];
  cameras: Camera[];
  inventory: InventoryItem[];
}> {
  const res = await fetch(`${BASE_URL}/centres/${centreId}`);
  if (!res.ok) throw new Error('Failed to fetch centre details');
  return res.json();
}

export async function fetchAlerts(params?: {
  centre_id?: string;
  status?: string;
  severity?: string;
}): Promise<ComplianceEvent[]> {
  const query = new URLSearchParams();
  if (params?.centre_id) query.append('centre_id', params.centre_id);
  if (params?.status) query.append('status', params.status);
  if (params?.severity) query.append('severity', params.severity);
  
  const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function reviewAlert(alertId: string, review: {
  status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW' | 'RESOLVED';
  review_notes: string;
  reviewed_by: string;
}): Promise<ComplianceEvent> {
  const res = await fetch(`${BASE_URL}/alerts/${alertId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to review alert');
  return res.json();
}

export async function fetchCameras(): Promise<Camera[]> {
  const res = await fetch(`${BASE_URL}/cameras`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${BASE_URL}/analytics/audit`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function triggerDemoScenario(scenario: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/demo/trigger-scenario?scenario=${scenario}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger demo scenario');
  return res.json();
}
