import React, { useState } from 'react';
import { KPIStrip } from '../components/KPIStrip';
import { AnalyticsOverview, Centre, ComplianceEvent } from '../types';
import { 
  Building2, 
  Video, 
  AlertTriangle, 
  ChevronRight, 
  ShieldAlert, 
  Clock, 
  Download, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  ArrowUpRight,
  MapPin,
  Filter
} from 'lucide-react';

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
  const [filterState, setFilterState] = useState<string>('ALL');

  const priorityAlerts = alerts
    .filter(a => a.status === 'NEW' || a.status === 'UNDER_REVIEW' || a.status === 'ESCALATED_TO_STATE')
    .slice(0, 6);

  const filteredCentres = centres.filter(c => {
    if (filterState === 'ALL') return true;
    if (filterState === 'CRITICAL') {
      return alerts.some(a => a.centre_id === c.id && a.severity === 'CRITICAL' && a.status !== 'DISMISSED');
    }
    if (filterState === 'NORMAL') {
      return !alerts.some(a => a.centre_id === c.id && a.severity === 'CRITICAL');
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operational Header Section */}
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
              National Command Matrix
            </span>

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
              ACTIVE MONITORING CYCLE 04
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Training Centre Monitoring
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            AI-assisted attendance & infrastructure compliance · Ministry of Skill Development and Entrepreneurship (MSDE), Government of India
          </p>
        </div>

        {/* Date and Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: '#334155',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Calendar size={14} color="#2563EB" />
            <span>Today, 24 Oct 2026</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Active Sessions Live</span>
          </div>

          <a
            href="/api/alerts/feedback/export-csv"
            download="national_briefing.csv"
            className="gov-btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Briefing</span>
          </a>
        </div>
      </section>

      {/* 6-Card Command Metric Ledger */}
      <KPIStrip analytics={analytics} />

      {/* Middle Split: Geo Territory Matrix & Priority Discrepancy Stream */}
      <div className="overview-split-layout" style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '20px' }}>
        
        {/* Left Column: Geographic Mesh & Monitored Hubs Matrix */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#2563EB" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                  Geographic National Mesh & Clusters
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                Real-time edge telemetry mapped across regional ITI & PMKK hubs
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '3px',
              gap: '4px'
            }}>
              {[
                { id: 'ALL', label: `All (${centres.length})` },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'NORMAL', label: 'Compliant' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterState(f.id)}
                  style={{
                    backgroundColor: filterState === f.id ? '#FFFFFF' : 'transparent',
                    color: filterState === f.id ? '#2563EB' : '#64748B',
                    border: filterState === f.id ? '1px solid #CBD5E1' : 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    boxShadow: filterState === f.id ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Visual Mockup Frame */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            backgroundColor: '#0F172A',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Dark Tactical Grid Canvas */}
            <svg style={{ width: '100%', height: '100%' }}>
              <defs>
                <pattern id="tac-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tac-grid)" />

              {/* Connecting Nodes across States */}
              <line x1="190" y1="75" x2="270" y2="48" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="270" y1="48" x2="300" y2="115" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="300" y1="115" x2="440" y2="105" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="190" y1="75" x2="170" y2="135" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="300" y1="115" x2="170" y2="135" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="170" y1="135" x2="250" y2="185" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="300" y1="115" x2="250" y2="185" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Delhi Apex TC-102 (NCT Delhi) */}
              <g transform="translate(270, 48)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-102')}>
                <circle cx="0" cy="0" r="13" fill="rgba(34, 197, 94, 0.25)" stroke="#22C55E" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4.5" fill="#22C55E" />
                <text x="16" y="3" fill="#E2E8F0" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TC-102 (Delhi PMKK)</text>
                <text x="16" y="14" fill="#4ADE80" fontSize="8.5" fontFamily="monospace">COMPLIANT · GDA LAB</text>
              </g>

              {/* Jaipur Hub TC-106 (Rajasthan) */}
              <g transform="translate(190, 75)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-106')}>
                <circle cx="0" cy="0" r="11" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="4" fill="#38BDF8" />
                <text x="-120" y="3" fill="#E2E8F0" fontSize="10" fontWeight="bold" fontFamily="monospace">TC-106 (Jaipur)</text>
                <text x="-120" y="14" fill="#38BDF8" fontSize="8.5" fontFamily="monospace">ACTIVE · CAD JEWELRY</text>
              </g>

              {/* Bhopal Regional TC-105 (Madhya Pradesh) */}
              <g transform="translate(300, 115)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-105')}>
                <circle cx="0" cy="0" r="12" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4" fill="#F59E0B" />
                <text x="16" y="3" fill="#E2E8F0" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TC-105 (Bhopal)</text>
                <text x="16" y="14" fill="#FBBF24" fontSize="8.5" fontFamily="monospace">SEWING DEFICIT (-4)</text>
              </g>

              {/* Ranchi Hub TC-103 (Jharkhand) */}
              <g transform="translate(440, 105)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-103')}>
                <circle cx="0" cy="0" r="13" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4.5" fill="#EF4444" />
                <text x="16" y="3" fill="#E2E8F0" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TC-103 (Ranchi ITI)</text>
                <text x="16" y="14" fill="#F87171" fontSize="8.5" fontFamily="monospace">CAM OFFLINE · SPOOLING</text>
              </g>

              {/* Pune Flagship Hub TC-101 (Maharashtra) */}
              <g transform="translate(170, 135)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-101')}>
                <circle cx="0" cy="0" r="14" fill="rgba(37, 99, 235, 0.25)" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="5" fill="#38BDF8" />
                <text x="-120" y="3" fill="#E2E8F0" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TC-101 (Pune Hub)</text>
                <text x="-120" y="14" fill="#38BDF8" fontSize="8.5" fontFamily="monospace">ATTENDANCE GAP (-40%)</text>
              </g>

              {/* Bengaluru Robotics TC-104 (Karnataka) */}
              <g transform="translate(250, 185)" style={{ cursor: 'pointer' }} onClick={() => onSelectCentre('TC-104')}>
                <circle cx="0" cy="0" r="12" fill="rgba(34, 197, 94, 0.25)" stroke="#22C55E" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4.5" fill="#22C55E" />
                <text x="16" y="3" fill="#E2E8F0" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TC-104 (Bengaluru)</text>
                <text x="16" y="14" fill="#4ADE80" fontSize="8.5" fontFamily="monospace">ROBOTICS · COMPLIANT</text>
              </g>
            </svg>

            {/* Tactical Watermark HUD */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '12px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              NIC / MSDE GIS Geospatial Layer Active · Precision ±5m
            </div>
          </div>

          {/* Directory Summary Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Centre Code & Title</th>
                <th style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>District</th>
                <th style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Capacity</th>
                <th style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                <th style={{ padding: '8px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCentres.map(c => {
                const hasCritical = alerts.some(a => a.centre_id === c.id && a.severity === 'CRITICAL' && a.status !== 'DISMISSED');
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.1s' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>{c.id}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{c.district}, {c.state}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.sanctioned_capacity} Trainees</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`status-badge ${hasCritical ? 'critical' : 'normal'}`}>
                        {hasCritical ? 'Discrepancy' : 'Compliant'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => onSelectCentre(c.id)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Inspect</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Priority Alerts Action Queue */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#DC2626" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                Priority Discrepancy Stream
              </h2>
            </div>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              fontWeight: 700
            }}>
              {priorityAlerts.length} Actionable
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {priorityAlerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748B',
                fontSize: '13px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px dashed #CBD5E1'
              }}>
                <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 600, color: '#0F172A' }}>No Open Discrepancies</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>All training centres operating within compliance thresholds.</div>
              </div>
            ) : (
              priorityAlerts.map(alert => {
                let payload: any = {};
                try { payload = alert.payload_json ? JSON.parse(alert.payload_json) : {}; } catch (e) {}

                return (
                  <div
                    key={alert.id}
                    style={{
                      borderLeft: `3px solid ${alert.severity === 'CRITICAL' ? '#DC2626' : '#D97706'}`,
                      backgroundColor: alert.severity === 'CRITICAL' ? '#FEF2F2' : '#FFFBEB',
                      borderTop: '1px solid #E2E8F0',
                      borderRight: '1px solid #E2E8F0',
                      borderBottom: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-badge ${alert.severity === 'CRITICAL' ? 'critical' : 'warning'}`}>
                          {alert.severity}
                        </span>
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                          {alert.event_type.replace(/_/g, ' ')}
                        </strong>
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#334155' }}>
                      <strong>Centre: {alert.centre_id}</strong>
                      {payload.reported !== undefined && (
                        <span> · Roster: {payload.reported} vs Observed: <strong style={{ color: '#DC2626' }}>{payload.observed}</strong> ({payload.difference} missing)</span>
                      )}
                      {payload.item_type && (
                        <span> · Asset: <strong>{payload.item_type}</strong> (Required: {payload.required}, Observed: {payload.observed})</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                        AI Confidence: <strong>{Math.round(alert.confidence * 100)}%</strong>
                      </span>
                      <button
                        onClick={() => onSelectAlert(alert)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Review Evidence</span>
                        <ArrowUpRight size={13} color="#2563EB" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
