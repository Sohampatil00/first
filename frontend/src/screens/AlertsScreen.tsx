import React, { useState } from 'react';
import { ComplianceEvent } from '../types';
import { AlertCircle, Filter, Eye, Clock, CheckCircle2, ShieldAlert, RefreshCw, ChevronRight, Lock } from 'lucide-react';
import { triggerSlaEscalation } from '../api';

interface AlertsScreenProps {
  alerts: ComplianceEvent[];
  onSelectAlert: (alert: ComplianceEvent) => void;
  onRefresh?: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ alerts, onSelectAlert, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [escalating, setEscalating] = useState<boolean>(false);
  const [escalateMessage, setEscalateMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesStatus && matchesSeverity;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="status-badge critical">NEW</span>;
      case 'UNDER_REVIEW': return <span className="status-badge review">UNDER REVIEW</span>;
      case 'CONFIRMED': return <span className="status-badge critical" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#DC2626' }}>CONFIRMED VIOLATION</span>;
      case 'DISMISSED': return <span className="status-badge normal">DISMISSED</span>;
      case 'ESCALATED_TO_STATE': return (
        <span className="status-badge critical" style={{ backgroundColor: '#7F1D1D', color: '#FECACA', border: '1px solid #991B1B' }}>
          ESCALATED TO STATE
        </span>
      );
      default: return <span className="status-badge info">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operational Header Bar */}
      <section style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '4px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}>
              Traceable Evidence Workspace
            </span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600
            }}>
              <span className="pulse-dot online"></span>
              SHA-256 IMMUTABLE AUDIT TRAIL
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Compliance Discrepancy Alerts
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            System-generated exceptions backed by observation windows and confidence thresholds
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunEscalation}
            disabled={escalating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={14} />
            <span>{escalating ? 'Scanning SLA...' : 'Run SLA Escalation Scan'}</span>
          </button>
        </div>
      </section>

      {/* SLA Notification Strip if triggered */}
      {escalateMessage && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '6px',
          padding: '10px 16px',
          fontSize: '13px',
          color: '#991B1B',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldAlert size={16} />
          <span>{escalateMessage}</span>
        </div>
      )}

      {/* Filter Ribbon: Severity & Status Tabs */}
      <div className="gov-card" style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Severity Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Severity:
          </span>
          {[
            { id: 'ALL', label: `All (${alerts.length})` },
            { id: 'CRITICAL', label: 'Critical Anomaly', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
            { id: 'HIGH', label: 'High Priority', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { id: 'NORMAL', label: 'Standard', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
          ].map(sev => (
            <button
              key={sev.id}
              onClick={() => setSeverityFilter(sev.id)}
              style={{
                backgroundColor: severityFilter === sev.id ? (sev.bg || '#F1F5F9') : 'transparent',
                color: severityFilter === sev.id ? (sev.color || '#0F172A') : '#64748B',
                border: severityFilter === sev.id ? `1px solid ${sev.border || '#CBD5E1'}` : '1px solid transparent',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: severityFilter === sev.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {sev.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '3px',
          gap: '3px'
        }}>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'ESCALATED_TO_STATE', 'CONFIRMED', 'DISMISSED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                backgroundColor: statusFilter === filter ? '#FFFFFF' : 'transparent',
                color: statusFilter === filter ? '#2563EB' : '#64748B',
                border: statusFilter === filter ? '1px solid #CBD5E1' : 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {filter.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table Card */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Case ID &amp; Event</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Centre &amp; Camera</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Severity</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Confidence</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp</th>
              <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Review Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div>No alerts match the selected filters.</div>
                </td>
              </tr>
            ) : (
              filteredAlerts.map(alert => {
                let payload: any = {};
                try { payload = alert.payload_json ? JSON.parse(alert.payload_json) : {}; } catch (e) {}

                return (
                  <tr
                    key={alert.id}
                    style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {alert.event_type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        CASE-{alert.id.slice(0, 8)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{alert.centre_id}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        {alert.camera_id || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`status-badge ${alert.severity === 'CRITICAL' ? 'critical' : (alert.severity === 'HIGH' ? 'warning' : 'normal')}`}>
                        {alert.severity}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      <span style={{ color: alert.confidence >= 0.9 ? '#059669' : '#D97706' }}>
                        {Math.round(alert.confidence * 100)}%
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(alert.status)}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => onSelectAlert(alert)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={13} />
                        <span>Review Evidence</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
