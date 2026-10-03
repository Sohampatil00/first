export interface Centre {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  sanctioned_capacity: number;
  status: string;
  created_at: string;
}

export interface Camera {
  id: string;
  centre_id: string;
  room_id?: string;
  name: string;
  source_type: string;
  stream_url?: string;
  status: 'ONLINE' | 'OFFLINE' | 'OBSTRUCTED';
  last_seen_at: string;
}

export interface InventoryItem {
  id: string;
  centre_id: string;
  room_id?: string;
  item_type: string;
  required_quantity: number;
  active: boolean;
}

export interface ComplianceEvent {
  id: string;
  centre_id: string;
  camera_id?: string;
  room_id?: string;
  event_type: 'ATTENDANCE_MISMATCH' | 'INFRASTRUCTURE_GAP' | 'CAMERA_OFFLINE' | 'CAMERA_OBSTRUCTED';
  severity: 'NORMAL' | 'REVIEW' | 'HIGH' | 'CRITICAL';
  confidence: number;
  status: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'RESOLVED';
  evidence_uri?: string;
  payload_json?: string;
  review_notes?: string;
  reviewed_by?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AnalyticsOverview {
  total_centres: number;
  active_centres: number;
  total_alerts: number;
  new_alerts: number;
  high_critical_alerts: number;
  online_cameras: number;
  total_cameras: number;
  average_attendance_compliance_pct: number;
  recent_events: ComplianceEvent[];
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata_json?: string;
  created_at: string;
}
