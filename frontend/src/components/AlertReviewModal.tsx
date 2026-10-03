import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Eye, Clock } from 'lucide-react';
import { ComplianceEvent } from '../types';

interface AlertReviewModalProps {
  alert: ComplianceEvent | null;
  onClose: () => void;
  onReviewSubmit: (alertId: string, status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW', notes: string) => Promise<void>;
}

export const AlertReviewModal: React.FC<AlertReviewModalProps> = ({ alert, onClose, onReviewSubmit }) => {
  if (!alert) return null;

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  let payload: any = {};
  try {
    payload = alert.payload_json ? JSON.parse(alert.payload_json) : {};
  } catch (e) {
    payload = {};
  }

  const handleAction = async (status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW') => {
    setLoading(true);
    try {
      await onReviewSubmit(alert.id, status, notes || `Reviewed as ${status} by monitoring officer.`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'status-badge critical';
      case 'HIGH': return 'status-badge high';
      case 'REVIEW': return 'status-badge review';
      default: return 'status-badge normal';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 8, 14, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={getSeverityBadgeClass(alert.severity)}>
              {alert.severity}
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {alert.event_type.replace(/_/g, ' ')}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Case ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{alert.id.slice(0, 8)}</span> • Centre: {alert.centre_id} • Camera: {alert.camera_id || 'N/A'}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Privacy Notice Banner */}
          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--accent-cyan)'
          }}>
            <ShieldCheck size={16} />
            <span>
              <strong>Privacy Protection Standard:</strong> Head count and asset bounding boxes only. No facial identities, biometric profiles, or personal databases are accessed.
            </span>
          </div>

          {/* Evidence Frame Preview */}
          <div style={{
            backgroundColor: '#070a10',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {alert.evidence_uri ? (
              <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={alert.evidence_uri} 
                  alt="AI Evidence Snapshot" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Live Snapshot Overlay • YOLOv8 Tracked
                </div>
              </div>
            ) : (
              <div style={{
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #172439 0%, #0a0e17 100%)',
                position: 'relative'
              }}>
                {/* Simulated visual bounding box overlays */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '60px',
                  width: '140px',
                  height: '160px',
                  border: '2px solid #10b981',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '4px'
                }}>
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>person #04 (94%)</span>
                  <span style={{ fontSize: '9px', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px' }}>[Face Blurred]</span>
                </div>

                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '80px',
                  width: '160px',
                  height: '140px',
                  border: alert.event_type.includes('INFRASTRUCTURE') ? '2px dashed #ef4444' : '2px solid #38bdf8',
                  borderRadius: '4px',
                  backgroundColor: alert.event_type.includes('INFRASTRUCTURE') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '4px'
                }}>
                  <span style={{ fontSize: '10px', color: alert.event_type.includes('INFRASTRUCTURE') ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>
                    {alert.event_type.includes('INFRASTRUCTURE') ? 'VACANT WORKBENCH (MISSING ASSET)' : 'computer #12 (89%)'}
                  </span>
                  <span style={{ fontSize: '9px', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px' }}>Sanctioned ROI</span>
                </div>

                <div style={{ textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
                  <Eye size={36} color="var(--accent-cyan)" style={{ opacity: 0.8, marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Visual Evidence Snapshot Package
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Captured at: {new Date(alert.created_at).toLocaleString()} • Model: YOLOv8-Edge-v1.4
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Structured Observation vs Sanctioned Comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            backgroundColor: 'var(--bg-card)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sanctioned / Reported
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }} className="tabular-nums">
                {payload.reported_count !== undefined ? payload.reported_count : (payload.sanctioned_quantity ?? '—')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline target</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AI Observed (Dwell ≥ 3m)
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }} className="tabular-nums">
                {payload.observed_count !== undefined ? payload.observed_count : (payload.observed_quantity ?? '—')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Confidence: {(alert.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Discrepancy Gap
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: 'var(--status-critical)', 
                marginTop: '4px' 
              }} className="tabular-nums">
                {payload.difference !== undefined ? `-${payload.difference}` : (payload.gap !== undefined ? `-${payload.gap}` : '—')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-critical)' }}>
                {payload.relative_difference_pct ? `${payload.relative_difference_pct}% deficit` : 'Deficit detected'}
              </div>
            </div>
          </div>

          {/* Officer Review Notes Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Officer Review Assessment & Audit Notes:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cross-checked with physical register TC-101-A. Attendance discrepancy confirmed."
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(10, 14, 23, 0.4)'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Actions are logged in the immutable government audit trail.
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              disabled={loading}
              onClick={() => handleAction('DISMISSED')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <XCircle size={16} />
              <span>Dismiss False Positive</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction('UNDER_REVIEW')}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--status-warning)',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={16} />
              <span>Escalate Case</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction('CONFIRMED')}
              style={{
                backgroundColor: 'var(--status-critical)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)'
              }}
            >
              <CheckCircle size={16} />
              <span>Confirm Violation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
