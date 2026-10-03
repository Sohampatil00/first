import React from 'react';
import { KPIStrip } from '../components/KPIStrip';
import { AnalyticsOverview, Centre, ComplianceEvent } from '../types';
import { AlertCircle, CheckCircle, ChevronRight, Activity, Clock, ShieldAlert } from 'lucide-react';

interface OverviewScreenProps {
  analytics: AnalyticsOverview | null;
  centres: Centre[];
  alerts: ComplianceEvent[];
  onSelectAlert: (alert: ComplianceEvent) => void;
  onSelectCentre: (centreId: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  analytics,
  centres,
  alerts,
  onSelectAlert,
  onSelectCentre
}) => {
  const priorityAlerts = alerts.filter(a => a.status === 'NEW' || a.status === 'UNDER_REVIEW').slice(0, 5);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'status-badge critical';
      case 'HIGH': return 'status-badge high';
      case 'REVIEW': return 'status-badge review';
      default: return 'status-badge normal';
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          National Command Centre Overview
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Real-time AI surveillance verification across MSDE sanctioned training institutes
        </p>
      </div>

      {/* KPI Cards */}
      <KPIStrip analytics={analytics} />

      {/* Main Grid: Priority Alerts & Centres Requiring Attention */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Monitored Centres Table */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Training Centres Status & Compliance
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Comparing observed attendance & inventory against sanction
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {centres.length} Active Hubs
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(10, 14, 23, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Centre Code & Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>State & District</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Sanction Cap</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Telemetry Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((centre) => {
                const centreAlerts = alerts.filter(a => a.centre_id === centre.id && a.status === 'NEW');
                return (
                  <tr 
                    key={centre.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{centre.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {centre.id} • {centre.location}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {centre.district}, {centre.state}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }} className="tabular-nums">
                      {centre.sanctioned_capacity} Trainees
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {centreAlerts.length > 0 ? (
                        <span className="status-badge high">
                          {centreAlerts.length} Flagged Gap
                        </span>
                      ) : (
                        <span className="status-badge normal">
                          Compliant
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => onSelectCentre(centre.id)}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'var(--accent-cyan)',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Inspect</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Priority Alerts Feed */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--status-critical)" />
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Priority Alerts Feed
              </h2>
            </div>
            <span style={{
              fontSize: '11px',
              backgroundColor: 'var(--status-critical-bg)',
              color: 'var(--status-critical)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 700
            }}>
              {priorityAlerts.length} Actionable
            </span>
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {priorityAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} color="var(--status-normal)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No Pending Violations</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>All camera observations align with sanctioned thresholds.</div>
              </div>
            ) : (
              priorityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={getSeverityBadgeClass(alert.severity)}>
                      {alert.severity}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {alert.event_type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Centre: <strong style={{ color: 'var(--accent-cyan)' }}>{alert.centre_id}</strong>
                  </div>

                  <div style={{
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--accent-cyan)'
                  }}>
                    <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                    <span style={{ fontWeight: 600 }}>Review Evidence →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
