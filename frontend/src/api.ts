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
  category?: string;
}): Promise<ComplianceEvent> {
  const res = await fetch(`${BASE_URL}/alerts/${alertId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to review alert');
  return res.json();
}

export async function fetchReviewFeedback(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/alerts/feedback/list`);
  if (!res.ok) throw new Error('Failed to fetch review feedback');
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

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${BASE_URL}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function updateRoomROI(centreId: string, roomId: string, roiPolygonJson: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/centres/${centreId}/rooms/${roomId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roi_polygon_json: roiPolygonJson })
  });
  if (!res.ok) throw new Error('Failed to update room ROI');
  return res.json();
}

export async function submitReportedAttendance(data: {
  centre_id: string;
  room_id?: string;
  session_date: string;
  session_start: string;
  session_end: string;
  reported_count: number;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/attendance/reported`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit reported attendance');
  return res.json();
}

export async function triggerSlaEscalation(forceHours?: number): Promise<any> {
  const url = forceHours !== undefined 
    ? `${BASE_URL}/alerts/escalate-pending?force_hours=${forceHours}`
    : `${BASE_URL}/alerts/escalate-pending`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run SLA escalation check');
  return res.json();
}

export async function inferWebcamFrame(
  base64Image: string, 
  reconcile: boolean = false,
  visionEngine: string = 'deim'
): Promise<any> {
  const res = await fetch(`${BASE_URL}/ai/webcam/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: base64Image,
      centre_id: 'TC-101',
      camera_id: 'CAM-101-A1',
      room_id: 'ROOM-101-A',
      reconcile,
      vision_engine: visionEngine
    })
  });
  if (!res.ok) throw new Error(`Webcam inference failed: ${res.statusText}`);
  return res.json();
}

export async function fetchVisionEngines(): Promise<any> {
  const res = await fetch(`${BASE_URL}/ai/vision-engines`);
  if (!res.ok) throw new Error('Failed to fetch vision engines');
  return res.json();
}


