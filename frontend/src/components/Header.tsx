import React from 'react';
import { Search, Bell, Shield, Wifi, RefreshCw, ChevronDown, Lock, CheckCircle2, Menu } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  onRefresh: () => void;
  openAlertsCount: number;
  currentRole: string;
  onRoleChange: (role: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  wsConnected, 
  onRefresh, 
  openAlertsCount,
  currentRole,
  onRoleChange,
  onToggleMobileMenu
}) => {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'MINISTRY_OFFICER': return 'Dr. V. Ramanathan (National Director)';
      case 'DISTRICT_OFFICER': return 'S. Patil (District Vigilance Officer)';
      case 'CENTRE_ADMIN': return 'P. Deshmukh (Centre Principal - TC-101)';
      default: return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MINISTRY_OFFICER': return 'Apex / GoI';
      case 'DISTRICT_OFFICER': return 'State / DVO';
      case 'CENTRE_ADMIN': return 'Centre / ITI';
      default: return 'User';
    }
  };

  return (
    <header className="header-container" style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    }}>
      {/* Left Region: Hamburger + Breadcrumb Trail & Privacy Protocol Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Toggle navigation menu"
          style={{
            background: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '6px',
            color: '#0F172A',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={18} />
        </button>

        {/* Territory Breadcrumb Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#F1F5F9',
          border: '1px solid #CBD5E1',
          padding: '5px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#334155'
        }}>
          <span className="header-breadcrumb-prefix">
            <span style={{ color: '#2563EB', fontWeight: 600 }}>All India</span>
            <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
            <span>Western Zone</span>
            <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
          </span>
          <strong style={{ color: '#0F172A' }}>Pune (TC-101)</strong>
          <ChevronDown size={14} color="#64748B" />
        </div>

        {/* Privacy Protocol Pill */}
        <div className="header-privacy-pill" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#065F46',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          <Lock size={12} color="#059669" />
          <span>PRIVACY PROTOCOL: DPDP COMPLIANT</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="header-search-bar" style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '420px',
        margin: '0 16px'
      }}>
        <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
        <input 
          type="text" 
          placeholder="Search centres, camera UID, alerts, or audit ref (Ctrl+K)..."
          style={{
            width: '100%',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '7px 12px 7px 36px',
            fontSize: '12px',
            color: '#0F172A',
            outline: 'none',
            fontFamily: 'var(--font-sans)'
          }}
        />
        <div style={{
          position: 'absolute',
          right: '8px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#059669',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '1px 6px',
          borderRadius: '3px',
          fontWeight: 600,
          pointerEvents: 'none'
        }}>
          Aggregate Mode
        </div>
      </div>

      {/* Right Command & Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Realtime Pipeline Latency Pip */}
        <div className="header-latency-pill" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot online"></span>
            <span>Pipeline: <strong style={{ color: '#059669' }}>24ms</strong></span>
          </div>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <div>
            Sync: <strong style={{ color: '#0F172A' }}>{wsConnected ? 'Live Active' : 'Offline Buffer'}</strong>
          </div>
        </div>

        {/* Data Refresh Button */}
        <button
          onClick={onRefresh}
          title="Refresh Data"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '7px 9px',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw size={15} />
        </button>

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '7px 9px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <Bell size={15} />
          </div>
          {openAlertsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#DC2626'
            }} />
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0' }} />

        {/* Multi-Role RBAC Officer Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#2563EB',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            border: '2px solid #BFDBFE'
          }}>
            {currentRole.slice(0, 2)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#0F172A',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <option value="MINISTRY_OFFICER">Dr. V. Ramanathan</option>
                <option value="DISTRICT_OFFICER">Officer S. Patil</option>
                <option value="CENTRE_ADMIN">Principal P. Deshmukh</option>
              </select>
              <span style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                fontWeight: 600
              }}>
                {getRoleBadge(currentRole)}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#64748B' }}>
              {currentRole === 'MINISTRY_OFFICER' ? 'National Director (IT & Mon)' : (
                currentRole === 'DISTRICT_OFFICER' ? 'District Vigilance Adjudicator' : 'Centre Administrator'
              )}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
