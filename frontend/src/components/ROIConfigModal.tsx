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

  const polygonSvgPoints = points.map(p => `${(p[0] / 960) * 100}%,${(p[1] / 540) * 100}%`).join(' ');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 8, 14, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '860px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <Crosshair size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Visual Calibration: Classroom ROI Polygon
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Centre: {centreId} • Room: {room.name} ({room.room_type})
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Interactive Calibration Canvas */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              💡 <strong>Instructions:</strong> Click on the camera viewport to place ROI boundary vertices. Persons inside this boundary are verified for session dwell attendance.
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {points.length} Vertices Set
            </span>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            backgroundColor: '#070a10',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            backgroundImage: 'radial-gradient(circle at center, #172439 0%, #070a10 100%)'
          }}>
            {/* Background classroom mock grid */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: 0.25
            }}>
              <Layers size={64} color="var(--accent-cyan)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
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
                  fill="rgba(16, 185, 129, 0.2)"
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

          {/* Coordinate Coordinates Strip */}
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {points.map((p, i) => (
              <span key={i} style={{ backgroundColor: 'var(--bg-card)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                P{i + 1}: [{p[0]}, {p[1]}]
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(10, 14, 23, 0.4)'
        }}>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset to Standard ROI</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '8px 14px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              disabled={saving}
              onClick={handleSave}
              style={{
                backgroundColor: 'var(--accent-cyan)',
                border: 'none',
                color: '#000',
                borderRadius: '6px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
              }}
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
