import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../api';
import { Sliders, Shield, Save, CheckCircle, Clock, AlertTriangle, EyeOff } from 'lucide-react';

interface SettingsScreenProps {
  currentRole: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentRole }) => {
  const [settings, setSettings] = useState<any>({
    attendance_tolerance_pct: 15.0,
    dwell_time_seconds: 180,
    asset_gap_threshold: 1,
    privacy_blur_mode: 'GAUSSIAN_FACE_MASK',
    evidence_retention_days: 90,
    auto_escalate_critical_hours: 24
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        ...settings,
        modified_by: currentRole
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(`Error saving policy: ${err.message}`);
    }
  };

  const isEditable = currentRole === 'MINISTRY_OFFICER' || currentRole === 'SYSTEM_ADMIN';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Policy & Governance Threshold Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Configurable decision criteria for discrepancy detection, dwell state machine, and data minimization
        </p>
      </div>

      {!isEditable && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--status-warning)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>
            <strong>Read-Only Mode:</strong> Only authorized <strong>Ministry Monitoring Officers</strong> or <strong>System Administrators</strong> can modify national compliance policies.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--status-normal)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>Governance policy parameters updated successfully and recorded in the audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Attendance Tolerance Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Attendance Policy Thresholds
            </h2>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Attendance Discrepancy Tolerance: ±{settings.attendance_tolerance_pct}%
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              disabled={!isEditable}
              value={settings.attendance_tolerance_pct}
              onChange={(e) => setSettings({ ...settings, attendance_tolerance_pct: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Discrepancies below this threshold are marked NORMAL (no alert).
            </span>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Dwell Verification Duration: {settings.dwell_time_seconds} seconds
            </label>
            <select
              disabled={!isEditable}
              value={settings.dwell_time_seconds}
              onChange={(e) => setSettings({ ...settings, dwell_time_seconds: parseInt(e.target.value) })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value={60}>60 seconds (Quick Verification)</option>
              <option value={180}>180 seconds / 3 mins (Standard MSDE)</option>
              <option value={300}>300 seconds / 5 mins (High Strictness)</option>
            </select>
          </div>
        </div>

        {/* Infrastructure & Assets Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--status-normal)" />
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Infrastructure Compliance Mandates
            </h2>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Asset Gap Severity Threshold
            </label>
            <select
              disabled={!isEditable}
              value={settings.asset_gap_threshold}
              onChange={(e) => setSettings({ ...settings, asset_gap_threshold: parseInt(e.target.value) })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value={1}>1 missing unit triggers REVIEW</option>
              <option value={2}>2 missing units triggers REVIEW</option>
              <option value={3}>3 missing units triggers HIGH</option>
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Evaluated against sanctioned inventory table per centre.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Auto-Escalate Unreviewed Critical Alerts
            </label>
            <select
              disabled={!isEditable}
              value={settings.auto_escalate_critical_hours}
              onChange={(e) => setSettings({ ...settings, auto_escalate_critical_hours: parseInt(e.target.value) })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value={12}>12 hours</option>
              <option value={24}>24 hours (Standard SLA)</option>
              <option value={48}>48 hours</option>
            </select>
          </div>
        </div>

        {/* Privacy & Evidence Retention Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOff size={18} color="#a855f7" />
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Privacy & Data Minimization
            </h2>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Face Anonymization Filter Mode
            </label>
            <select
              disabled={!isEditable}
              value={settings.privacy_blur_mode}
              onChange={(e) => setSettings({ ...settings, privacy_blur_mode: e.target.value })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value="GAUSSIAN_FACE_MASK">Gaussian Blur Mask (Active)</option>
              <option value="BLACKOUT_BOX">Solid Blackout Head Box</option>
              <option value="NO_IMAGE_METADATA_ONLY">Zero Image Storage (Metadata Only)</option>
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Complies with Digital Personal Data Protection Act (DPDPA).
            </span>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Evidence Snapshot Retention Period
            </label>
            <select
              disabled={!isEditable}
              value={settings.evidence_retention_days}
              onChange={(e) => setSettings({ ...settings, evidence_retention_days: parseInt(e.target.value) })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days (Recommended)</option>
              <option value={180}>180 Days (Fiscal Year Audit)</option>
            </select>
          </div>
        </div>

        {/* Action Button Strip */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <button
            type="submit"
            disabled={!isEditable}
            style={{
              backgroundColor: isEditable ? 'var(--accent-cyan)' : 'var(--border-strong)',
              color: isEditable ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isEditable ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isEditable ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <Save size={16} />
            <span>Save Governance Policy</span>
          </button>
        </div>

      </form>
    </div>
  );
};
