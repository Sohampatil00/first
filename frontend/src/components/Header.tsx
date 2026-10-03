import React from 'react';
import { Search, Bell, Shield, Wifi, RefreshCw, UserCheck } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  onRefresh: () => void;
  openAlertsCount: number;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  wsConnected, 
  onRefresh, 
  openAlertsCount,
  currentRole,
  onRoleChange
}) => {
  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '8px 14px',
        width: '360px'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by Centre Code (e.g. TC-101), District..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            width: '100%'
          }}
        />
      </div>

      {/* Right Command Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* WebSocket Realtime Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '9999px',
          backgroundColor: wsConnected ? 'var(--status-normal-bg)' : 'var(--status-warning-bg)',
          border: `1px solid ${wsConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          fontSize: '12px',
          fontWeight: 600,
          color: wsConnected ? 'var(--status-normal)' : 'var(--status-warning)'
        }}>
          <Wifi size={14} />
          <span>{wsConnected ? 'Live Sync Active' : 'Connecting Sync...'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh Data"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={16} />
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '8px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={16} />
          </div>
          {openAlertsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-critical)',
              boxShadow: '0 0 6px var(--status-critical)'
            }} />
          )}
        </div>

        {/* RBAC Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            fontSize: '12px'
          }}>
            <Shield size={16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active RBAC Role
            </span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <option value="MINISTRY_OFFICER" style={{ background: '#111827', color: '#fff' }}>Ministry Officer (National)</option>
              <option value="DISTRICT_OFFICER" style={{ background: '#111827', color: '#fff' }}>District Officer (Adjudicator)</option>
              <option value="CENTRE_ADMIN" style={{ background: '#111827', color: '#fff' }}>Centre Principal (TC-101)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
