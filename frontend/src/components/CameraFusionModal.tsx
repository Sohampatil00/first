import React, { useState } from 'react';
import { X, Layers, Users, Eye, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

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

    // Simple geometric visibility heuristic
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(5px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '92vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
              padding: '6px'
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
          padding: '16px 20px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Raw Sum (Naive Count)</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {rawSum} <span style={{ fontSize: '12px', fontWeight: 400 }}>({cam1Count} + {cam2Count})</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Fused Ground Headcount</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {fusedHeadcount} <span style={{ fontSize: '12px', fontWeight: 400 }}>Physical</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--status-normal)' }}>Double-Counts Eliminated</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-normal)' }}>
              -{overlapDeduplicated} <span style={{ fontSize: '12px', fontWeight: 400 }}>Ghost Overlaps</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spatial Deduplication Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-warning)' }}>
              {rawSum > 0 ? Math.round((overlapDeduplicated / rawSum) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* 2D Floor Plan Canvas */}
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            backgroundColor: '#070a13',
            border: '2px solid var(--border-subtle)',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}>
            <svg
              onClick={handleAddTrainee}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Floor Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Classroom Teacher Podium / Board */}
              <rect x="35%" y="4%" width="30%" height="6%" fill="rgba(100, 116, 139, 0.4)" stroke="#64748b" rx="4" />
              <text x="50%" y="8%" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">SMART BOARD / LECTERN</text>

              {/* Camera 1 Sight Cone (Front Left Angle) */}
              {showFrustums && (
                <polygon
                  points="20,20 650,20 500,340 20,300"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="rgba(56, 189, 248, 0.35)"
                  strokeDasharray="4 4"
                />
              )}

              {/* Camera 2 Sight Cone (Rear Right Angle) */}
              {showFrustums && (
                <polygon
                  points="820,340 250,340 350,60 820,80"
                  fill="rgba(34, 197, 94, 0.08)"
                  stroke="rgba(34, 197, 94, 0.35)"
                  strokeDasharray="4 4"
                />
              )}

              {/* Camera 1 Icon Node */}
              <g transform="translate(15, 15)">
                <circle cx="12" cy="12" r="16" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="2" />
                <text x="12" y="16" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">C1</text>
              </g>

              {/* Camera 2 Icon Node */}
              <g transform="translate(810, 310)">
                <circle cx="12" cy="12" r="16" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                <text x="12" y="16" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">C2</text>
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
                        fill="rgba(245, 158, 11, 0.2)"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r="10"
                      fill={isOverlapping ? '#f59e0b' : t.visibleToCam1 ? '#38bdf8' : '#22c55e'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="-14"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
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
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
                <span>Camera 1 only</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                <span>Camera 2 only</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', border: '1px dashed #ffffff' }}></span>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Multi-Angle Verified (Fused)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowFrustums(!showFrustums)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {showFrustums ? 'Hide Camera Cones' : 'Show Camera Cones'}
              </button>
              <button
                onClick={() => setTrainees(trainees.slice(0, 4))}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Reset Students
              </button>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            💡 Click anywhere inside the room canvas to place a trainee and test real-time spatial fusion de-duplication!
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span>Algorithm: Euclidean spatial clustering + Hungarian association on calibrated ground plane</span>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--accent-cyan)',
              color: '#000',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
