import React from 'react';
import { Search, Bell, Shield, Wifi, RefreshCw } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  onRefresh: () => void;
  openAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, onRefresh, openAlertsCount }) => {
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
        width: '380px'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by Centre Code (e.g. TC-101), District, State..."
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

        {/* Officer Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
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
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Monitoring Officer
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              National Cell • MSDE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
