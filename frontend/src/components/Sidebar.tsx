import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Video, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Sliders,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, openAlertsCount }) => {
  const navItems = [
    { id: 'overview', label: 'Command Centre', icon: LayoutDashboard },
    { id: 'centres', label: 'Centres Directory', icon: Building2 },
    { id: 'cameras', label: 'Live Video & Edge', icon: Video },
    { id: 'alerts', label: 'Compliance Alerts', icon: AlertTriangle, badge: openAlertsCount },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'audit', label: 'Governance & Audit', icon: ShieldCheck },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '16px',
          boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)'
        }}>
          MSDE
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            CentreWatch AI
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            GovTech Monitoring v1.0
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 8px 8px', letterSpacing: '0.05em' }}>
          National Monitoring
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  backgroundColor: 'var(--status-critical-bg)',
                  color: 'var(--status-critical)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Operational Status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(10, 14, 23, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span className="pulse-dot online"></span>
            <span>Edge Pipeline Online</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--status-normal)', fontWeight: 600 }}>Active</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Privacy: No facial ID stored
        </div>
      </div>
    </aside>
  );
};
