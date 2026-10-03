import React from 'react';
import { Building2, Network, CheckSquare, ShieldCheck, AlertTriangle, Video } from 'lucide-react';
import { AnalyticsOverview } from '../types';

interface KPIStripProps {
  analytics: AnalyticsOverview | null;
}

export const KPIStrip: React.FC<KPIStripProps> = ({ analytics }) => {
  const cards = [
    {
      label: 'Monitored Centres',
      value: analytics ? `${analytics.total_centres}` : '3',
      subLeft: '+12 this quarter',
      subLeftColor: '#059669',
      subRight: '28 States/UTs',
      barColor: '#2563EB',
      barPct: 100,
      icon: Building2,
      iconColor: '#2563EB'
    },
    {
      label: 'Centres Online',
      value: analytics ? `${analytics.active_centres}` : '3',
      valueSub: analytics ? `/ ${analytics.total_centres}` : '/ 3',
      subLeft: '100% Active Mesh',
      subLeftColor: '#059669',
      subRight: '0 Degraded',
      subRightColor: '#64748B',
      barColor: '#10B981',
      barPct: 100,
      icon: Network,
      iconColor: '#10B981'
    },
    {
      label: 'Attendance Comp.',
      value: analytics ? `${analytics.average_attendance_compliance_pct.toFixed(1)}%` : '89.4%',
      subLeft: '±15% dev tolerance',
      subLeftColor: '#64748B',
      subRight: 'Stable MoM',
      subRightColor: '#059669',
      barColor: '#4f46e5',
      barPct: analytics ? analytics.average_attendance_compliance_pct : 89.4,
      icon: CheckSquare,
      iconColor: '#4f46e5'
    },
    {
      label: 'Infr. Compliance',
      value: '94.2%',
      subLeft: 'Sanctioned Mandates',
      subLeftColor: '#64748B',
      subRight: 'IT & Welding Labs',
      subRightColor: '#64748B',
      barColor: '#0d9488',
      barPct: 94.2,
      icon: ShieldCheck,
      iconColor: '#0d9488'
    },
    {
      label: 'Priority Alerts',
      value: analytics ? `${analytics.new_alerts}` : '0',
      valueSub: `/ ${analytics?.high_critical_alerts || 0} Critical`,
      valueColor: analytics && analytics.new_alerts > 0 ? '#DC2626' : '#0F172A',
      subLeft: 'Backlog: 14m avg',
      subLeftColor: '#0F172A',
      subRight: '98% SLA',
      subRightColor: '#059669',
      barColor: '#EF4444',
      barPct: Math.min(100, ((analytics?.new_alerts || 1) * 20)),
      icon: AlertTriangle,
      iconColor: '#DC2626'
    },
    {
      label: 'Edge Cameras',
      value: analytics ? `${analytics.online_cameras}` : '8',
      valueSub: analytics ? `/ ${analytics.total_cameras}` : '/ 8',
      subLeft: '99.5% >15 FPS',
      subLeftColor: '#059669',
      subRight: '1.8 KB/s Sync',
      subRightColor: '#2563EB',
      barColor: '#2563EB',
      barPct: 98,
      icon: Video,
      iconColor: '#2563EB'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
      gap: '14px',
      marginBottom: '20px'
    }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="gov-card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'default'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.label}
                </span>
                <Icon size={16} color={card.iconColor} />
              </div>

              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: card.valueColor || '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }} className="tabular-nums">
                {card.value} {card.valueSub && (
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    {card.valueSub}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                marginBottom: '6px'
              }}>
                <span style={{ color: card.subLeftColor, fontWeight: 600 }}>{card.subLeft}</span>
                <span style={{ color: card.subRightColor }}>{card.subRight}</span>
              </div>

              <div style={{ width: '100%', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${card.barPct}%`,
                  height: '100%',
                  backgroundColor: card.barColor,
                  borderRadius: '3px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
