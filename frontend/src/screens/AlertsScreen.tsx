import React, { useState } from 'react';
import { ComplianceEvent } from '../types';
import { AlertCircle, Filter, Eye, Clock, CheckCircle2 } from 'lucide-react';

interface AlertsScreenProps {
  alerts: ComplianceEvent[];
  onSelectAlert: (alert: ComplianceEvent) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ alerts, onSelectAlert }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

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
      default: return <span className="status-badge info">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Compliance Discrepancy Alerts
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            System-generated exceptions backed by observation windows and confidence thresholds
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '4px',
          borderRadius: '8px'
        }}>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'CONFIRMED', 'DISMISSED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                backgroundColor: statusFilter === filter ? 'var(--bg-card-hover)' : 'transparent',
                color: statusFilter === filter ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
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
