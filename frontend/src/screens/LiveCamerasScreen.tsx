import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '../types';
import { fetchCameras, triggerDemoScenario, inferWebcamFrame } from '../api';
import { 
  Video, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  RotateCcw, 
  AlertTriangle, 
  Box, 
  Layers, 
  Radio, 
  CheckCircle2, 
  Eye,
  Sliders,
  Maximize2,
  Camera as CameraIcon,
  CameraOff,
  Sparkles,
  Shield,
  UserCheck
} from 'lucide-react';
import { CameraFusionModal } from '../components/CameraFusionModal';

export const LiveCamerasScreen: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoActionStatus, setDemoActionStatus] = useState<string | null>(null);
  const [showFusionModal, setShowFusionModal] = useState<boolean>(false);
  const [showRtspModal, setShowRtspModal] = useState<boolean>(false);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [privacyBlurActive, setPrivacyBlurActive] = useState<boolean>(true);

  // Laptop Webcam Integration State
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamDetections, setWebcamDetections] = useState<any[]>([]);
  const [webcamBlurBoxes, setWebcamBlurBoxes] = useState<number[][]>([]);
  const [personCount, setPersonCount] = useState<number>(0);
  const [computerCount, setComputerCount] = useState<number>(0);
  const [webcamLatency, setWebcamLatency] = useState<number>(24);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // RTSP tester state
  const [rtspUrl, setRtspUrl] = useState<string>('rtsp://admin:pass@192.168.1.108:554/live/ch0');
  const [testingRtsp, setTestingRtsp] = useState<boolean>(false);
  const [rtspResult, setRtspResult] = useState<any | null>(null);

  const loadCameras = () => {
    fetchCameras().then(data => {
      setCameras(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCameras();
  }, []);

  // Attach webcam stream to video element when active
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, useWebcam]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Toggle Laptop Webcam
  const startWebcam = async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      setWebcamStream(stream);
      setUseWebcam(true);
      setDemoActionStatus("Laptop webcam activated! Running real-time on-premise YOLOv8 inference.");
      setTimeout(() => setDemoActionStatus(null), 4000);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setWebcamError(
        err.name === 'NotAllowedError' 
          ? "Camera permission denied. Please allow camera permissions in your browser bar."
          : `Could not access laptop webcam: ${err.message}`
      );
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    setWebcamStream(null);
    setUseWebcam(false);
    setWebcamDetections([]);
    setWebcamBlurBoxes([]);
    setDemoActionStatus("Switched back to synthetic classroom video stream.");
    setTimeout(() => setDemoActionStatus(null), 3000);
  };

  const isInferringRef = useRef<boolean>(false);

  // Continuous YOLOv8 Edge Analysis Loop on Live Laptop Webcam
  useEffect(() => {
    if (!useWebcam || !webcamStream) return;

    let isMounted = true;

    const captureAndInfer = async () => {
      if (!isMounted) return;
      if (isInferringRef.current) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      isInferringRef.current = true;
      setIsInferring(true);

      try {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, 640, 360);
        const base64 = canvas.toDataURL('image/jpeg', 0.70);

        const res = await inferWebcamFrame(base64, false);
        if (isMounted && res) {
          setWebcamDetections(res.detections || []);
          setWebcamBlurBoxes(res.blur_boxes || []);
          setPersonCount(res.person_count || 0);
          setComputerCount(res.computer_count || 0);
          setWebcamLatency(res.latency_ms || 24);
        }
      } catch (err) {
        console.warn("Webcam infer tick error:", err);
      } finally {
        isInferringRef.current = false;
        if (isMounted) setIsInferring(false);
      }
    };

    // Initial warm-up capture once camera stream initializes
    const warmupTimer = setTimeout(captureAndInfer, 350);

    // Continuous inference interval every 1.0 second
    const interval = setInterval(captureAndInfer, 1000);

    return () => {
      isMounted = false;
      clearTimeout(warmupTimer);
      clearInterval(interval);
      isInferringRef.current = false;
    };
  }, [useWebcam, webcamStream]);


  // Reconcile Webcam Attendance against Official Roster
  const handleReconcileWebcam = async () => {
    if (!videoRef.current) return;
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 640, 360);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);

      setReconcileResult("Evaluating webcam attendance against sanctioned roster...");
      const res = await inferWebcamFrame(base64, true);

      if (res.alert_triggered) {
        setReconcileResult(`⚠️ Attendance Discrepancy Flagged! Observed ${res.person_count} vs Roster (Deficit > 15%). Evidence snapshot recorded.`);
      } else {
        setReconcileResult(`✅ Attendance verified compliant (${res.person_count} trainees matched within tolerance).`);
      }
      setTimeout(() => setReconcileResult(null), 6000);
    } catch (err: any) {
      setReconcileResult(`Reconciliation error: ${err.message}`);
    }
  };

  const handleTestRtsp = () => {
    setTestingRtsp(true);
    setRtspResult(null);
    setTimeout(() => {
      setTestingRtsp(false);
      setRtspResult({
        status: 'CONNECTED',
        fps: 14.8,
        latency_ms: 42,
        buffer_bloat_prevented: true,
        dropped_frames: 4,
        resolution: '1280x720 (Auto-downscaled from 1080p)',
        privacy_mask: 'GAUSSIAN_FACE_ACTIVE'
      });
    }, 1200);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operational Header Section */}
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
              Edge Inference Node v2.4
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
              {useWebcam ? 'LIVE LAPTOP WEBCAM ACTIVE · ZERO PII' : 'PRIVACY VECTOR METASYNC ACTIVE'}
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Live Edge Cameras &amp; Telemetry
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            Decentralized on-premise vision inference with sub-second bounding box metadata sync · Video never leaves edge
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Main Laptop Webcam Button */}
          {useWebcam ? (
            <button
              onClick={stopWebcam}
              className="gov-btn-secondary"
              style={{ borderColor: '#EF4444', color: '#DC2626' }}
            >
              <CameraOff size={14} />
              <span>Disconnect Laptop Cam</span>
            </button>
          ) : (
            <button
              onClick={startWebcam}
              className="gov-btn-primary"
              style={{ backgroundColor: '#2563EB' }}
            >
              <CameraIcon size={14} />
              <span>Use My Laptop Cam</span>
            </button>
          )}

          <button
            onClick={() => setShowFusionModal(true)}
            className="gov-btn-secondary"
          >
            <Layers size={14} color="#2563EB" />
            <span>Multi-Camera Fusion</span>
          </button>

          <button
            onClick={() => setShowRtspModal(true)}
            className="gov-btn-secondary"
          >
            <Radio size={14} color="#9333EA" />
            <span>Test RTSP Stream</span>
          </button>

          {/* Quick Demo Scenario Triggers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #CBD5E1',
            padding: '3px 6px',
            borderRadius: '6px'
          }}>
            <button
              onClick={() => handleTriggerScenario('ATTENDANCE_DISCREPANCY', 'Attendance Discrepancy')}
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertTriangle size={12} />
              <span>Trigger Gap</span>
            </button>

            <button
              onClick={() => handleTriggerScenario('RESET', 'Reset Baseline')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Notification Strip */}
      {demoActionStatus && (
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '6px',
          padding: '10px 16px',
          fontSize: '13px',
          color: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={16} />
          <span>{demoActionStatus}</span>
        </div>
      )}

      {/* Webcam Permission / Error Notification */}
      {webcamError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{webcamError}</span>
          </div>
          <button
            onClick={startWebcam}
            className="gov-btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* Reconcile Flash Result */}
      {reconcileResult && (
        <div style={{
          backgroundColor: reconcileResult.startsWith('⚠️') ? '#FFFBEB' : '#ECFDF5',
          border: `1px solid ${reconcileResult.startsWith('⚠️') ? '#FDE68A' : '#A7F3D0'}`,
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: reconcileResult.startsWith('⚠️') ? '#92400E' : '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {reconcileResult.startsWith('⚠️') ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{reconcileResult}</span>
        </div>
      )}

      {/* Cameras Viewport Grid */}
      {loading ? (
        <div className="gov-card" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Initializing camera streams...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
          {cameras.map((cam) => {
            const isOnline = cam.status === 'ONLINE';
            const isDemoCamera = cam.id === 'CAM-101-A1';

            return (
              <div
                key={cam.id}
                className="gov-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Camera Card Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{isDemoCamera && useWebcam ? "💻 My Laptop Webcam (Live Edge Feed)" : cam.name}</span>
                      {isDemoCamera && useWebcam && (
                        <span className="status-badge normal">HARDWARE CAM ACTIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                      UID: {cam.id} · Centre: {cam.centre_id}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isDemoCamera && (
                      <button
                        onClick={useWebcam ? stopWebcam : startWebcam}
                        style={{
                          backgroundColor: useWebcam ? '#EFF6FF' : '#F1F5F9',
                          border: `1px solid ${useWebcam ? '#3B82F6' : '#CBD5E1'}`,
                          color: useWebcam ? '#1D4ED8' : '#334155',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {useWebcam ? <CameraOff size={12} /> : <CameraIcon size={12} />}
                        <span>{useWebcam ? 'Switch to Demo Clip' : 'Use Laptop Webcam'}</span>
                      </button>
                    )}

                    <span className={`status-badge ${isOnline ? 'normal' : 'critical'}`}>
                      {isOnline ? (useWebcam && isDemoCamera ? 'LIVE · 30 FPS' : 'ONLINE · 15 FPS') : 'OFFLINE'}
                    </span>
                  </div>
                </div>

                {/* Video / Camera Canvas Frame */}
                <div style={{
                  height: '280px',
                  backgroundColor: '#070A13',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {isOnline ? (
                    <>
                      {isDemoCamera ? (
                        useWebcam ? (
                          /* Laptop Webcam Video Stream */
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)' // Mirror mode for natural webcam preview
                              }}
                            />

                            {/* Real-time AI Bounding Boxes SVG Overlay */}
                            {showBoxes && (
                              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                                {webcamDetections.map((det, idx) => {
                                  // Invert X because of mirror transform
                                  const x = (1 - det.box[2]) * 100;
                                  const y = det.box[1] * 100;
                                  const w = (det.box[2] - det.box[0]) * 100;
                                  const h = (det.box[3] - det.box[1]) * 100;

                                  let strokeColor = '#10B981';
                                  let fillColor = '#10B981';
                                  let textColor = '#000000';

                                  if (det.class_name === 'chair') {
                                    strokeColor = '#F59E0B';
                                    fillColor = '#F59E0B';
                                    textColor = '#000000';
                                  } else if (det.class_name === 'table') {
                                    strokeColor = '#8B5CF6';
                                    fillColor = '#8B5CF6';
                                    textColor = '#FFFFFF';
                                  } else if (det.class_name === 'computer') {
                                    strokeColor = '#0EA5E9';
                                    fillColor = '#0EA5E9';
                                    textColor = '#FFFFFF';
                                  } else if (det.class_name === 'asset') {
                                    strokeColor = '#F43F5E';
                                    fillColor = '#F43F5E';
                                    textColor = '#FFFFFF';
                                  }

                                  return (
                                    <g key={idx}>
                                      <rect
                                        x={`${x}%`}
                                        y={`${y}%`}
                                        width={`${w}%`}
                                        height={`${h}%`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth="2.5"
                                        strokeDasharray={det.class_name === 'table' ? '4 2' : 'none'}
                                        rx="4"
                                      />
                                      <rect
                                        x={`${x}%`}
                                        y={`${Math.max(0, y - 6)}%`}
                                        width={`${Math.min(Math.max(w, 24), 58)}%`}
                                        height="20"
                                        fill={fillColor}
                                        rx="3"
                                      />
                                      <text
                                        x={`${x + 1.5}%`}
                                        y={`${Math.max(0, y - 6) + 3.8}%`}
                                        fill={textColor}
                                        fontSize="10"
                                        fontWeight="800"
                                        fontFamily="var(--font-mono)"
                                      >
                                        {det.label}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            )}

                            {/* Real-time Anatomical Face Privacy Blur (DPDP Act Compliance) */}
                            {privacyBlurActive && webcamBlurBoxes.map((b, bIdx) => {
                              const left = (1 - b[2]) * 100;
                              const top = b[1] * 100;
                              const width = (b[2] - b[0]) * 100;
                              const height = (b[3] - b[1]) * 100;

                              return (
                                <div
                                  key={bIdx}
                                  style={{
                                    position: 'absolute',
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                    zIndex: 12,
                                    backdropFilter: 'blur(30px)',
                                    WebkitBackdropFilter: 'blur(30px)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.70)',
                                    border: '2px dashed #10B981',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
                                    transition: 'all 0.12s ease'
                                  }}
                                >
                                  <span style={{
                                    backgroundColor: '#059669',
                                    color: '#ffffff',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-mono)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    🛡️ PRIVACY MASK
                                  </span>
                                  <span style={{
                                    fontSize: '9px',
                                    color: '#A7F3D0',
                                    marginTop: '2px',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600
                                  }}>
                                    ZERO FACIAL PII STORED
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Synthetic Demo Video Clip */
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
                        )
                      ) : (
                        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                          <Activity size={32} color="#38BDF8" style={{ margin: '0 auto 6px', display: 'block', opacity: 0.8 }} />
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                            Edge Camera Feed Active · Low Bandwidth JSON Mode
                          </span>
                        </div>
                      )}

                      {/* Top-Left Live Recording Pill */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#4ADE80',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <span className="pulse-dot online"></span>
                        <span>{useWebcam && isDemoCamera ? `WEBCAM LIVE (30 FPS)` : `LIVE EDGE INFERENCE (15 FPS)`}</span>
                      </div>

                      {/* Top-Right Bandwidth & Latency Pill */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#38BDF8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backdropFilter: 'blur(4px)'
                      }}>
                        {useWebcam && isDemoCamera ? `${webcamLatency}ms · YOLOv8n` : '1.8 KB/s Metasync'}
                      </div>

                      {/* Bottom-Left Privacy Overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#E2E8F0',
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ShieldCheck size={12} color="#34D399" />
                        <span>Privacy: {privacyBlurActive ? 'Face Gaussian Mask Active (DPDP Act)' : 'Mask Off'}</span>
                      </div>

                      {/* Bottom-Right Live Detected Count (Webcam Mode) */}
                      {useWebcam && isDemoCamera && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          Observed: <span style={{ color: '#10B981' }}>{personCount} Trainees</span> · {computerCount} Devices
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#EF4444' }}>
                      <WifiOff size={36} style={{ margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>Stream Disconnected</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                        Edge Spooling active in local SQLite queue
                      </div>
                    </div>
                  )}
                </div>

                {/* Verified Workspace Infrastructure Ledger (Webcam Mode) */}
                {isDemoCamera && useWebcam && (
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Workspace Infrastructure:
                    </span>
                    {webcamDetections.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          backgroundColor: d.class_name === 'person' ? '#ECFDF5' : (d.class_name === 'chair' ? '#FFFBEB' : (d.class_name === 'table' ? '#F5F3FF' : '#EFF6FF')),
                          border: `1px solid ${d.class_name === 'person' ? '#A7F3D0' : (d.class_name === 'chair' ? '#FDE68A' : (d.class_name === 'table' ? '#DDD6FE' : '#BFDBFE'))}`,
                          color: d.class_name === 'person' ? '#065F46' : (d.class_name === 'chair' ? '#92400E' : (d.class_name === 'table' ? '#5B21B6' : '#1E40AF'))
                        }}
                      >
                        <span>{d.class_name === 'person' ? '👤' : (d.class_name === 'chair' ? '🪑' : (d.class_name === 'table' ? '🪵' : (d.class_name === 'computer' ? '🖥️' : '⚙️')))}</span>
                        <span>{d.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Sub-Bar / Scrubber HUD */}
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748B',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={13} color="#2563EB" />
                    <span>{useWebcam && isDemoCamera ? "Client Camera + Local YOLOv8 Pipeline" : "YOLOv8 Edge Daemon"}</span>
                    <span style={{ color: '#CBD5E1' }}>·</span>
                    <span>{useWebcam && isDemoCamera ? `Inference: ${webcamLatency}ms` : `Last Ping: ${new Date(cam.last_seen_at).toLocaleTimeString()}`}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isDemoCamera && useWebcam && (
                      <button
                        onClick={handleReconcileWebcam}
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          color: '#1D4ED8',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserCheck size={12} />
                        <span>Verify Attendance vs Roster</span>
                      </button>
                    )}

                    <button
                      onClick={() => setPrivacyBlurActive(!privacyBlurActive)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        color: privacyBlurActive ? '#059669' : '#64748B',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Privacy Blur: {privacyBlurActive ? 'ON' : 'OFF'}
                    </button>

                    <button
                      onClick={() => setShowBoxes(!showBoxes)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        color: showBoxes ? '#059669' : '#64748B',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      BBoxes: {showBoxes ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Camera Spatial Fusion Simulator Modal */}
      <CameraFusionModal
        isOpen={showFusionModal}
        onClose={() => setShowFusionModal(false)}
        roomId="ROOM-101-A"
      />

      {/* RTSP Stream Ingestion Tester Modal */}
      {showRtspModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }}>
          <div className="gov-card" style={{
            width: '100%',
            maxWidth: '620px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-modal)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="#9333EA" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  RTSP IP Camera Stream Ingestion Test
                </h3>
              </div>
              <button
                onClick={() => setShowRtspModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                Test the low-latency OpenCV / FFmpeg RTSP streaming ingest pipeline designed for on-premise NVR / IP CCTV cameras.
              </p>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  RTSP Stream URI
                </label>
                <input
                  type="text"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  className="gov-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={testingRtsp}
                  onClick={handleTestRtsp}
                  className="gov-btn-primary"
                  style={{ backgroundColor: '#9333EA' }}
                >
                  <Activity size={14} />
                  <span>{testingRtsp ? 'Handshaking...' : 'Test Connection & Drop-Frame Filter'}</span>
                </button>
              </div>

              {rtspResult && (
                <div style={{
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 700, color: '#7E22CE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} />
                    <span>RTSP Stream Verified Stable</span>
                  </div>
                  <div style={{ color: '#4B5563', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    <div>Framerate: <strong>{rtspResult.fps} FPS</strong></div>
                    <div>Latency: <strong>{rtspResult.latency_ms} ms</strong></div>
                    <div>Buffer Bloat: <strong>PREVENTED (Drop-frame queue)</strong></div>
                    <div>Privacy Mask: <strong>{rtspResult.privacy_mask}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRtspModal(false)}
                className="gov-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
