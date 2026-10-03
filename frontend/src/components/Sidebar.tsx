import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Video, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders,
  BarChart3,
  HelpCircle,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, openAlertsCount }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'centres', label: 'Centres & Twin', icon: Building2, badge: '3' },
    { id: 'cameras', label: 'Live Cameras', icon: Video, recBadge: true },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, alertCount: openAlertsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Log', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside style={{
      width: '272px',
      backgroundColor: '#0F172A',
      borderRight: '1px solid #1E293B',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 50,
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)'
    }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#0A0F1D',
        borderBottom: '1px solid #1E293B'
      }}>
        {/* Ashoka / MSDE Official Emblem Icon */}
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '15px',
          letterSpacing: '-0.02em',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
        }}>
          🇮🇳
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              CentreWatch AI
            </span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: '#1e3a8a',
              color: '#93c5fd',
              border: '1px solid #1d4ed8',
              fontWeight: 600
            }}>
              v2.4
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            MSDE · Government of India
          </span>
        </div>
      </div>

      {/* National Mesh Live Status Banner */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(51, 65, 85, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot online"></span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              National Mesh Live
            </span>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
            99.8%
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '8px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px 4px', letterSpacing: '0.06em' }}>
          National Console
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
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#2563EB' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#1E293B';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={17} color={isActive ? '#ffffff' : (item.id === 'alerts' && (item.alertCount || 0) > 0 ? '#f87171' : '#94a3b8')} />
                <span>{item.label}</span>
              </div>

              {item.recBadge && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? '#d1fae5' : '#34d399',
                  fontWeight: 600
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399' }}></span>
                  REC
                </span>
              )}

              {item.badge && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                }}>
                  {item.badge}
                </span>
              )}

              {item.alertCount !== undefined && item.alertCount > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#7f1d1d',
                  color: '#fecaca',
                  border: '1px solid #991b1b',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontWeight: 700
                }}>
                  {item.alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Edge Telemetry Strip */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: '#0A0F1D',
        borderTop: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Node Network Card */}
        <div style={{
          padding: '8px 10px',
          borderRadius: '6px',
          backgroundColor: '#1E293B',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#94a3b8' }}>Edge Mesh Node</span>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399' }}></span>
              SYNCED
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 500 }}>
            3 Online Hubs · 8 Streams
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#0f172a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#2563eb' }}></div>
          </div>
        </div>

        {/* Low-Bandwidth Mode Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#38bdf8" />
            <span>Low-Bandwidth Mode</span>
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            padding: '1px 5px',
            borderRadius: '4px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            fontWeight: 600
          }}>
            1.8 KB/s
          </span>
        </div>

        {/* DPDP Compliance Notice */}
        <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} color="#34d399" />
          <span>Zero Biometrics · DPDP Act 2023</span>
        </div>
      </div>
    </aside>
  );
};
