import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../api';
import { Sliders, Shield, Save, CheckCircle, Clock, AlertTriangle, EyeOff, ShieldCheck, Lock, Zap } from 'lucide-react';

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
              Policy Engine v2.4
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
              CENTRAL POLICY REPOSITORY
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Policy &amp; Governance Threshold Settings
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            Configurable operational parameters for discrepancy detection, dwell state machine, and data minimization
          </p>
        </div>
      </section>

      {!isEditable && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#D97706" />
          <span>
            <strong>Read-Only Mode:</strong> Active role is <code style={{ fontWeight: 700 }}>{currentRole}</code>. Only authorized <strong>Ministry Monitoring Officers</strong> or <strong>System Administrators</strong> can modify national compliance parameters.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} color="#059669" />
          <span>Governance policy parameters updated successfully and recorded in the audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Attendance Tolerance Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Attendance Discrepancy Tolerance (%)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Acceptable variance percentage before an exception case is raised
            </div>
          </div>
          <input
            type="number"
            step="1"
            min="0"
            max="50"
            disabled={!isEditable}
            value={settings.attendance_tolerance_pct}
            onChange={(e) => setSettings({ ...settings, attendance_tolerance_pct: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Standard national threshold is set to 15.0%.
          </span>
        </div>

        {/* Dwell Time Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Mandatory Dwell Threshold (Seconds)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Consecutive presence in classroom ROI required to mark attendance
            </div>
          </div>
          <input
            type="number"
            step="10"
            min="30"
            max="1800"
            disabled={!isEditable}
            value={settings.dwell_time_seconds}
            onChange={(e) => setSettings({ ...settings, dwell_time_seconds: parseInt(e.target.value) })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Current: {settings.dwell_time_seconds} seconds ({Math.round(settings.dwell_time_seconds / 60)} minutes).
          </span>
        </div>

        {/* Asset Gap Threshold Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Asset Deficit Sensitivity (Units)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Minimum missing equipment count triggering an infrastructure alert
            </div>
          </div>
          <input
            type="number"
            min="1"
            max="10"
            disabled={!isEditable}
            value={settings.asset_gap_threshold}
            onChange={(e) => setSettings({ ...settings, asset_gap_threshold: parseInt(e.target.value) })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Alert triggers when verified assets &lt; (Sanctioned - Threshold).
          </span>
        </div>

        {/* SLA Auto-Escalation Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Critical Alert Auto-Escalate SLA (Hours)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Maximum unreviewed window before escalating case to State Vigilance
            </div>
          </div>
          <input
            type="number"
            min="1"
            max="72"
            disabled={!isEditable}
            value={settings.auto_escalate_critical_hours}
            onChange={(e) => setSettings({ ...settings, auto_escalate_critical_hours: parseInt(e.target.value) })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Unresolved critical events auto-transition to ESCALATED_TO_STATE after {settings.auto_escalate_critical_hours}h.
          </span>
        </div>

        {/* Privacy Blur Mode Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Edge Privacy Masking Protocol
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Edge filter mode applied to snapshot evidence before transmission
            </div>
          </div>
          <select
            disabled={!isEditable}
            value={settings.privacy_blur_mode}
            onChange={(e) => setSettings({ ...settings, privacy_blur_mode: e.target.value })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#0F172A'
            }}
          >
            <option value="GAUSSIAN_FACE_MASK">Gaussian Face Blur Mask (Enforced Standard)</option>
            <option value="SILHOUETTE_ONLY">Silhouette / Bounding Box Fill Only</option>
            <option value="PIXELATION_24PX">Heavy Pixelation Filter (24px)</option>
          </select>
          <span style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} />
            <span>Guarantees DPDP Act 2023 compliance. Biometric features masked.</span>
          </span>
        </div>

        {/* SOTA Vision Model Architecture Card (DEIM CVPR 2025) */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #C7D2FE', backgroundColor: '#F8FAFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#4F46E5" />
                <span>Default Edge Vision Architecture</span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                border: '1px solid #C7D2FE'
              }}>
                CVPR 2025 SOTA
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
              Transformer-based detection framework for crowded classroom monitoring
            </div>
          </div>

          <select
            disabled={!isEditable}
            value={settings.default_vision_engine || 'DEIM_HGNETV2_N'}
            onChange={(e) => setSettings({ ...settings, default_vision_engine: e.target.value })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#0F172A',
              fontWeight: 600
            }}
          >
            <option value="DEIM_HGNETV2_N">DEIM-D-FINE-N (CVPR 2025 · Dense O2O · NMS-Free · 4.0M Params)</option>
            <option value="DEIM_RTDETR_R18">DEIM-RT-DETR-R18 (ResNet18 Backbone · 20M Params)</option>
            <option value="YOLOV8_POSE">Ultralytics YOLOv8n + YOLOv8-Pose (Anchor-Free CNN)</option>
          </select>

          <div style={{
            fontSize: '11px',
            color: '#3730A3',
            backgroundColor: '#EEF2FF',
            padding: '8px 10px',
            borderRadius: '6px',
            lineHeight: '1.4'
          }}>
            ⚡ <strong>Dense One-to-One Matching (Dense O2O):</strong> Removes Non-Maximum Suppression (NMS) latency and bounding box suppression artifacts in occluded training rooms.
          </div>
        </div>

        {/* Evidence Retention Card */}
        <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Evidence Storage Retention (Days)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Data lifecycle purge period for privacy-blurred evidence snapshots
            </div>
          </div>
          <input
            type="number"
            min="30"
            max="365"
            disabled={!isEditable}
            value={settings.evidence_retention_days}
            onChange={(e) => setSettings({ ...settings, evidence_retention_days: parseInt(e.target.value) })}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Snapshots older than {settings.evidence_retention_days} days are automatically expunged.
          </span>
        </div>

        {/* Form Actions */}
        {isEditable && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button
              type="submit"
              className="gov-btn-primary"
            >
              <Save size={15} />
              <span>Save &amp; Record Policy Update</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
