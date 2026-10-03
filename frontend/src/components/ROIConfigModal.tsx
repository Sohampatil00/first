import React, { useState } from 'react';
import { X, Save, RotateCcw, CheckCircle, Crosshair, Layers } from 'lucide-react';
import { updateRoomROI } from '../api';

interface ROIConfigModalProps {
  centreId: string;
  room: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ROIConfigModal: React.FC<ROIConfigModalProps> = ({ centreId, room, onClose, onSaved }) => {
  if (!room) return null;

  // Initial points from room or standard preset
  const defaultPolygon = [
    [80, 130],
    [880, 130],
    [920, 510],
    [40, 510]
  ];

  let initialPoints = defaultPolygon;
  try {
    if (room.roi_polygon_json) {
      initialPoints = JSON.parse(room.roi_polygon_json);
    }
  } catch (e) {
    initialPoints = defaultPolygon;
  }

  const [points, setPoints] = useState<number[][]>(initialPoints);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 960);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 540);
    
    // Add point or replace if 4 exist
    if (points.length >= 4) {
      setPoints([[x, y]]);
    } else {
      setPoints([...points, [x, y]]);
    }
  };

  const handleReset = () => {
    setPoints(defaultPolygon);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRoomROI(centreId, room.id, JSON.stringify(points));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSaved();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Failed to save ROI: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '860px',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Crosshair size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Visual Calibration: Classroom ROI Polygon
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Centre: {centreId} • Room: {room.name} ({room.room_type})
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Interactive Calibration Canvas */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--primary-light)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              💡 <strong>Calibration Instructions:</strong> Click inside the camera viewport to anchor 4 boundary vertices. Trainees within this zone are tracked for official session dwell verification.
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>
              {points.length} / 4 Vertices Set
            </span>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            backgroundColor: '#0b132b',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-strong)',
            backgroundImage: 'radial-gradient(circle at center, #172439 0%, #0b132b 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {/* Background classroom mock grid */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: 0.35
            }}>
              <Layers size={54} color="#60a5fa" style={{ margin: '0 auto 8px', display: 'block' }} />
              <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>
                Live Stream Video Viewport (CAM-101-A1)
              </span>
            </div>

            {/* Interactive SVG Overlay */}
            <svg
              onClick={handleCanvasClick}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'crosshair'
              }}
            >
              {points.length >= 3 && (
                <polygon
                  points={points.map(p => `${(p[0] / 960) * 812},${(p[1] / 540) * 340}`).join(' ')}
                  fill="rgba(5, 150, 105, 0.25)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
              )}

              {points.map((p, idx) => {
                const cx = (p[0] / 960) * 812;
                const cy = (p[1] / 540) * 340;
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="6" fill="#38bdf8" stroke="#fff" strokeWidth="2" />
                    <text x={cx + 8} y={cy - 6} fill="#fff" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
                      P{idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Coordinate Strip */}
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {points.map((p, i) => (
              <span key={i} style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                P{i + 1}: [{p[0]}, {p[1]}]
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={handleReset}
            className="gov-btn-secondary"
          >
            <RotateCcw size={14} />
            <span>Reset Standard ROI</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="gov-btn-secondary"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              onClick={handleSave}
              className="gov-btn-primary"
            >
              {success ? <CheckCircle size={14} /> : <Save size={14} />}
              <span>{success ? 'Calibrated!' : (saving ? 'Saving...' : 'Save ROI Calibration')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
