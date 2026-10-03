import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Eye, Clock, Lock } from 'lucide-react';
import { ComplianceEvent } from '../types';

interface AlertReviewModalProps {
  alert: ComplianceEvent | null;
  onClose: () => void;
  onReviewSubmit: (alertId: string, status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW', notes: string, category?: string) => Promise<void>;
}

export const AlertReviewModal: React.FC<AlertReviewModalProps> = ({ alert, onClose, onReviewSubmit }) => {
  if (!alert) return null;

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('GHOST_TRAINEES');

  let payload: any = {};
  try {
    payload = alert.payload_json ? JSON.parse(alert.payload_json) : {};
  } catch (e) {
    payload = {};
  }

  const handleAction = async (status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW') => {
    setLoading(true);
    try {
      const finalCategory = status === 'CONFIRMED' 
        ? selectedCategory 
        : (status === 'DISMISSED' ? (selectedCategory.startsWith('DISMISS') ? selectedCategory : 'CAMERA_OCCLUSION') : 'ESCALATION_INVESTIGATION');
      await onReviewSubmit(alert.id, status, notes || `Adjudicated as ${status} [Category: ${finalCategory}] by monitoring officer.`, finalCategory);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="gov-card" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-badge ${alert.severity === 'CRITICAL' ? 'critical' : (alert.severity === 'HIGH' ? 'warning' : 'normal')}`}>
              {alert.severity}
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {alert.event_type.replace(/_/g, ' ')}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Case UID: <strong>CASE-{alert.id.slice(0, 8)}</strong> · Centre: <strong>{alert.centre_id}</strong> · Camera: {alert.camera_id || 'N/A'}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Privacy Notice Banner */}
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#065F46'
          }}>
            <Lock size={15} color="#059669" />
            <span>
              <strong>Privacy Protection Standard:</strong> Automated Gaussian blurring applied over face regions. No biometric vectors or Aadhaar identities accessed or stored.
            </span>
          </div>

          {/* Evidence Frame Preview */}
          <div style={{
            backgroundColor: '#070A13',
            border: '1px solid #0F172A',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {alert.evidence_uri ? (
              <div style={{ position: 'relative', width: '100%', height: '270px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={alert.evidence_uri} 
                  alt="Audit Evidence Snapshot" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#4ADE80',
                  fontWeight: 600
                }}>
                  CONFIDENCE: {Math.round(alert.confidence * 100)}%
                </div>
              </div>
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
                Structured Telemetry Package (No visual snapshot linked)
              </div>
            )}
          </div>

          {/* Discrepancy Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Reported Batch Roster
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }} className="tabular-nums">
                {payload.reported !== undefined ? payload.reported : (payload.required !== undefined ? payload.required : '—')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Center Self-Submission
              </div>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                AI Observed In Lab
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563EB', marginTop: '4px' }} className="tabular-nums">
                {payload.observed !== undefined ? payload.observed : '—'}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                Dwell Threshold &ge; 180s
              </div>
            </div>

            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600, textTransform: 'uppercase' }}>
                Reconciled Delta Gap
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }} className="tabular-nums">
                {payload.difference !== undefined ? `-${payload.difference}` : (payload.gap !== undefined ? `-${payload.gap}` : '—')}
              </div>
              <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                {payload.relative_difference_pct ? `${payload.relative_difference_pct}% deficit` : 'Deficit Detected'}
              </div>
            </div>
          </div>

          {/* Root Cause / Discrepancy Classification (Active Learning Feedback) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Root Cause / Exception Category (Active Learning Feedback):
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#1D4ED8',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <optgroup label="-- Violations (Confirming Violation) --">
                <option value="GHOST_TRAINEES">Ghost Trainees on Roster (Reported Trainees Absent)</option>
                <option value="EARLY_DISMISSAL">Early Dismissal / Mandatory Dwell Time Deficit</option>
                <option value="EQUIPMENT_ABSENT">Sanctioned Hardware Missing or Substituted</option>
                <option value="BATCH_INACTIVE">Empty Lab During Mandated Training Session</option>
              </optgroup>
              <optgroup label="-- False Positives / Exceptions (Dismissing Alert) --">
                <option value="CAMERA_OCCLUSION">Camera Angle / Architectural Column Occlusion</option>
                <option value="LIGHTING_GLARE">Excessive Sunlight Glare / Contrast Artifact</option>
                <option value="APPROVED_FIELD_VISIT">Approved Off-Campus Industrial Visit</option>
                <option value="EQUIPMENT_MAINTENANCE">Equipment Relocated for Scheduled Repair</option>
              </optgroup>
            </select>
          </div>

          {/* Officer Review Notes Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Officer Review Assessment &amp; Audit Notes:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cross-checked with physical register TC-101-A. Attendance discrepancy confirmed."
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#0F172A',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Actions are recorded in the immutable SHA-256 government audit trail.
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              disabled={loading}
              onClick={() => handleAction('DISMISSED')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <XCircle size={15} />
              <span>Dismiss False Positive</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction('UNDER_REVIEW')}
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#92400E',
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={15} />
              <span>Escalate Case</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction('CONFIRMED')}
              style={{
                backgroundColor: '#DC2626',
                border: '1px solid #B91C1C',
                color: '#FFFFFF',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <CheckCircle size={15} />
              <span>Confirm Violation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
