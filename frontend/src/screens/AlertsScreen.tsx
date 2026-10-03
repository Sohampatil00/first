import React, { useState } from 'react';
import { ComplianceEvent } from '../types';
import { AlertCircle, Filter, Eye, Clock, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import { triggerSlaEscalation } from '../api';

interface AlertsScreenProps {
  alerts: ComplianceEvent[];
  onSelectAlert: (alert: ComplianceEvent) => void;
  onRefresh?: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ alerts, onSelectAlert, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [escalating, setEscalating] = useState<boolean>(false);
  const [escalateMessage, setEscalateMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleRunEscalation = async () => {
    setEscalating(true);
    setEscalateMessage(null);
    try {
      const res = await triggerSlaEscalation();
      setEscalateMessage(`SLA Scan Complete: ${res.escalated_count} critical alert(s) auto-escalated to State.`);
      if (onRefresh) onRefresh();
      setTimeout(() => setEscalateMessage(null), 4000);
    } catch (e: any) {
      setEscalateMessage(`Escalation check error: ${e.message}`);
    } finally {
      setEscalating(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="status-badge critical">NEW</span>;
      case 'UNDER_REVIEW': return <span className="status-badge review">UNDER REVIEW</span>;
      case 'CONFIRMED': return <span className="status-badge high">CONFIRMED VIOLATION</span>;
      case 'DISMISSED': return <span className="status-badge normal">DISMISSED</span>;
      case 'ESCALATED_TO_STATE': return (
        <span className="status-badge critical" style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#f87171' }}>
          ESCALATED TO STATE
        </span>
      );
      default: return <span className="status-badge info">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Compliance Discrepancy Alerts
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            System-generated exceptions backed by observation windows and confidence thresholds
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunEscalation}
            disabled={escalating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              color: 'var(--status-critical)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={14} />
            <span>{escalating ? 'Scanning SLA...' : 'Run SLA Escalation Scan'}</span>
          </button>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {['ALL', 'NEW', 'UNDER_REVIEW', 'ESCALATED_TO_STATE', 'CONFIRMED', 'DISMISSED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                style={{
                  backgroundColor: statusFilter === filter ? 'var(--bg-card-hover)' : 'transparent',
                  color: statusFilter === filter ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {filter.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {escalateMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '8px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--status-critical)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={14} />
          <span>{escalateMessage}</span>
        </div>
      )}

      {/* Alerts Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(10, 14, 23, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Case ID & Event</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Centre & Camera</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Severity</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>AI Confidence</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Timestamp</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Review Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No alerts match the selected status filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr 
                  key={alert.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.event_type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {alert.id.slice(0, 12)}...
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{alert.centre_id}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alert.camera_id || 'Room Stream'}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={getSeverityBadgeClass(alert.severity)}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }} className="tabular-nums">
                    {(alert.confidence * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(alert.status)}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => onSelectAlert(alert)}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={14} color="var(--accent-cyan)" />
                      <span>Examine Evidence</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
