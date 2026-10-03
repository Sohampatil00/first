import React, { useState, useEffect } from 'react';
import { Camera } from '../types';
import { fetchCameras, triggerDemoScenario } from '../api';
import { Video, Wifi, WifiOff, ShieldCheck, Activity, Cpu, Play, RotateCcw, AlertTriangle, Box } from 'lucide-react';

export const LiveCamerasScreen: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoActionStatus, setDemoActionStatus] = useState<string | null>(null);

  const loadCameras = () => {
    fetchCameras().then(data => {
      setCameras(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleTriggerScenario = async (scenario: string, label: string) => {
    setDemoActionStatus(`Triggering ${label}...`);
    try {
      await triggerDemoScenario(scenario);
      setDemoActionStatus(`Success: ${label} executed! Check alerts table.`);
      loadCameras();
      setTimeout(() => setDemoActionStatus(null), 4000);
    } catch (e: any) {
      setDemoActionStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Edge Camera Feeds & Inference Monitoring
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Low-bandwidth edge agents process video locally and upload structured telemetry & evidence packages
          </p>
        </div>

        {/* Live Demo Controller Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 10px',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demo Controls:
          </span>

          <button
            onClick={() => handleTriggerScenario('ATTENDANCE_DISCREPANCY', 'Attendance Discrepancy')}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: 'var(--status-critical)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={13} />
            <span>Trigger Attendance Gap</span>
          </button>

          <button
            onClick={() => handleTriggerScenario('INFRASTRUCTURE_GAP', 'Equipment Gap')}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: 'var(--status-warning)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Box size={13} />
            <span>Trigger Asset Gap</span>
          </button>

          <button
            onClick={() => handleTriggerScenario('RESET', 'Reset Baseline')}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {demoActionStatus && (
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '6px',
          padding: '8px 14px',
          marginBottom: '18px',
          fontSize: '12px',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span className="pulse-dot online"></span>
          <span>{demoActionStatus}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading camera streams...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          {cameras.map((cam) => {
            const isOnline = cam.status === 'ONLINE';
            const isDemoCamera = cam.id === 'CAM-101-A1';

            return (
              <div
                key={cam.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Camera Video Viewport */}
                <div style={{
                  height: '260px',
                  backgroundColor: '#070a10',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {isOnline ? (
                    <>
                      {isDemoCamera ? (
                        <video
                          src="/api/videos/demo_classroom_discrepancy.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                          <Activity size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 6px', display: 'block', opacity: 0.7 }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Edge Camera Feed Active
                          </span>
                        </div>
                      )}

                      {/* Active Video Overlay Elements */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--status-normal)',
                        fontWeight: 600,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <span className="pulse-dot online"></span>
                        <span>LIVE EDGE INFERENCE (10 FPS)</span>
                      </div>

                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        1.8 KB/s Metasync
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Privacy: Bounding Box Metadata Only
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--status-critical)' }}>
                      <WifiOff size={36} style={{ margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>Stream Disconnected</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Edge Spooling active in local SQLite queue
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Card Footer */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {cam.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {cam.id} • Centre: {cam.centre_id}
                      </div>
                    </div>
                    <span className={`status-badge ${isOnline ? 'normal' : 'critical'}`}>
                      {cam.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Cpu size={12} />
                      YOLOv8 Edge Daemon
                    </span>
                    <span>Last Telemetry Ping: {new Date(cam.last_seen_at).toLocaleTimeString()}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
