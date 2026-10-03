import React, { useState } from 'react';
import { X, Layers, Users, Eye, CheckCircle2, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

interface CameraFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
}

interface SimulatedTrainee {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  visibleToCam1: boolean;
  visibleToCam2: boolean;
}

export const CameraFusionModal: React.FC<CameraFusionModalProps> = ({ isOpen, onClose, roomId = "ROOM-101-A" }) => {
  const [trainees, setTrainees] = useState<SimulatedTrainee[]>([
    { id: 'TR-1', x: 25, y: 35, visibleToCam1: true, visibleToCam2: false },
    { id: 'TR-2', x: 38, y: 40, visibleToCam1: true, visibleToCam2: true },
    { id: 'TR-3', x: 50, y: 45, visibleToCam1: true, visibleToCam2: true },
    { id: 'TR-4', x: 65, y: 35, visibleToCam1: true, visibleToCam2: true },
    { id: 'TR-5', x: 75, y: 55, visibleToCam1: false, visibleToCam2: true },
    { id: 'TR-6', x: 30, y: 65, visibleToCam1: true, visibleToCam2: false },
    { id: 'TR-7', x: 45, y: 70, visibleToCam1: true, visibleToCam2: true },
    { id: 'TR-8', x: 60, y: 75, visibleToCam1: false, visibleToCam2: true },
  ]);

  const [showFrustums, setShowFrustums] = useState(true);

  if (!isOpen) return null;

  // Compute multi-camera metrics
  const cam1Count = trainees.filter(t => t.visibleToCam1).length;
  const cam2Count = trainees.filter(t => t.visibleToCam2).length;
  const rawSum = cam1Count + cam2Count;
  const fusedHeadcount = trainees.length;
  const overlapDeduplicated = rawSum - fusedHeadcount;

  const handleAddTrainee = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Geometric visibility heuristic
    const vis1 = (x < 70 && y < 80);
    const vis2 = (x > 30 && y > 30);

    const newT: SimulatedTrainee = {
      id: `TR-${trainees.length + 1}`,
      x,
      y,
      visibleToCam1: vis1,
      visibleToCam2: vis2
    };
    setTrainees([...trainees, newT]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '92vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-modal)'
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
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Multi-Camera Spatial Fusion & De-duplication Simulator
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Target: {roomId} (IT & Electronics Lab) • Ground-plane perspective homography
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Real-time Metric Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raw Sum (Naive Count)</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular-nums">
              {rawSum} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>({cam1Count} + {cam2Count})</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Fused Ground Headcount</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }} className="tabular-nums">
              {fusedHeadcount} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--primary)' }}>Physical</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--status-normal-bg)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--status-normal-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--status-normal-text)', textTransform: 'uppercase' }}>Eliminated Overlaps</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-normal-text)', marginTop: '2px' }} className="tabular-nums">
              -{overlapDeduplicated} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--status-normal-text)' }}>Ghosts</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deduplication Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-warning-text)', marginTop: '2px' }} className="tabular-nums">
              {rawSum > 0 ? Math.round((overlapDeduplicated / rawSum) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* 2D Floor Plan Canvas */}
        <div style={{ padding: '24px', flex: 1 }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            backgroundColor: '#0b132b',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            cursor: 'crosshair',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <svg
              onClick={handleAddTrainee}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Floor Grid */}
              <defs>
                <pattern id="fusion-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fusion-grid)" />

              {/* Classroom Teacher Podium / Board */}
              <rect x="35%" y="4%" width="30%" height="6%" fill="rgba(100, 116, 139, 0.4)" stroke="#64748b" rx="4" />
              <text x="50%" y="8%" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">SMART BOARD / LECTERN</text>

              {/* Camera 1 Sight Cone (Front Left Angle) */}
              {showFrustums && (
                <polygon
                  points="20,20 650,20 500,340 20,300"
                  fill="rgba(37, 99, 235, 0.12)"
                  stroke="rgba(37, 99, 235, 0.5)"
                  strokeDasharray="4 4"
                />
              )}

              {/* Camera 2 Sight Cone (Rear Right Angle) */}
              {showFrustums && (
                <polygon
                  points="820,340 250,340 350,60 820,80"
                  fill="rgba(5, 150, 105, 0.12)"
                  stroke="rgba(5, 150, 105, 0.5)"
                  strokeDasharray="4 4"
                />
              )}

              {/* Camera 1 Icon Node */}
              <g transform="translate(15, 15)">
                <circle cx="12" cy="12" r="16" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="2" />
                <text x="12" y="16" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">C1</text>
              </g>

              {/* Camera 2 Icon Node */}
              <g transform="translate(810, 310)">
                <circle cx="12" cy="12" r="16" fill="rgba(5, 150, 105, 0.25)" stroke="#059669" strokeWidth="2" />
                <text x="12" y="16" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">C2</text>
              </g>

              {/* Trainee Markers */}
              {trainees.map((t) => {
                const isOverlapping = t.visibleToCam1 && t.visibleToCam2;
                return (
                  <g key={t.id} transform={`translate(${t.x * 8.4}, ${t.y * 3.4})`}>
                    {isOverlapping && (
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="rgba(217, 119, 6, 0.25)"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r="10"
                      fill={isOverlapping ? '#d97706' : t.visibleToCam1 ? '#2563eb' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="-14"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                    >
                      {t.id} {isOverlapping ? '(FUSED)' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Guidance & Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '14px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Camera 1 only</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Camera 2 only</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#d97706', border: '1px dashed #ffffff' }}></span>
                <span style={{ color: 'var(--status-warning-text)', fontWeight: 700 }}>Multi-Angle Verified (Fused)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowFrustums(!showFrustums)}
                className="gov-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px' }}
              >
                {showFrustums ? 'Hide Camera Cones' : 'Show Camera Cones'}
              </button>
              <button
                onClick={() => setTrainees(trainees.slice(0, 4))}
                className="gov-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px' }}
              >
                Reset Students
              </button>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            💡 Click anywhere inside the room canvas to place a trainee and test real-time spatial fusion de-duplication.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>Algorithm: Euclidean spatial clustering + Hungarian association on calibrated ground plane</span>
          </div>
          <button
            onClick={onClose}
            className="gov-btn-primary"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
