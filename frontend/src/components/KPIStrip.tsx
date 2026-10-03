import React from 'react';
import { Building, Video, Users, AlertOctagon } from 'lucide-react';
import { AnalyticsOverview } from '../types';

interface KPIStripProps {
  analytics: AnalyticsOverview | null;
}

export const KPIStrip: React.FC<KPIStripProps> = ({ analytics }) => {
  const cards = [
    {
      label: 'Monitored Centres',
      value: analytics ? `${analytics.active_centres} / ${analytics.total_centres}` : '—',
      sub: 'All active training hubs',
      icon: Building,
      accent: 'var(--accent-cyan)',
      bg: 'rgba(56, 189, 248, 0.08)'
    },
    {
      label: 'Edge Cameras Online',
      value: analytics ? `${analytics.online_cameras} / ${analytics.total_cameras}` : '—',
      sub: `${analytics && analytics.online_cameras === analytics.total_cameras ? '100% telemetry healthy' : '1 camera offline'}`,
      icon: Video,
      accent: 'var(--status-normal)',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'Attendance Compliance',
      value: analytics ? `${analytics.average_attendance_compliance_pct.toFixed(1)}%` : '—',
      sub: '±15% policy tolerance applied',
      icon: Users,
      accent: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.08)'
    },
    {
      label: 'Open Compliance Alerts',
      value: analytics ? `${analytics.new_alerts}` : '—',
      sub: `${analytics?.high_critical_alerts || 0} requiring urgent review`,
      icon: AlertOctagon,
      accent: 'var(--status-critical)',
      bg: 'rgba(239, 68, 68, 0.08)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {card.label}
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.accent
              }}>
                <Icon size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
                {card.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
