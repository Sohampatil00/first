import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { fetchAuditLogs } from '../api';
import { ShieldCheck, User, Calendar, FileText, Lock, Download, CheckCircle2 } from 'lucide-react';

export const AuditScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operational Header */}
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
              GovTech Governance Matrix
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
              CRYPTOGRAPHIC TAMPER-EVIDENT LEDGER
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Governance &amp; Immutable Audit Trail
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            Every alert verification, dismissal, escalation, and threshold modification is cryptographically logged for Central Vigilance Commission (CVC) compliance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/api/alerts/feedback/export-csv"
            download="centrewatch_audit_ledger.csv"
            className="gov-btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} color="#64748B" />
            <span>Export Audit Trail</span>
          </a>
        </div>
      </section>

      {/* Audit Log Card Table */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#2563EB" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Official Audit Event Logbook
            </h2>
          </div>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: 600 }}>
            {logs.length} Recorded Entries
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
            Retrieving tamper-evident ledger...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp (IST)</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actor Identity</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action Executed</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Entity</th>
                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Metadata &amp; Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div>No audit events recorded yet.</div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1D4ED8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#2563EB" />
                        {log.actor_id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: '11px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                      {log.entity_type} <span style={{ color: '#94A3B8' }}>({log.entity_id.slice(0, 8)}...)</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.metadata_json || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
