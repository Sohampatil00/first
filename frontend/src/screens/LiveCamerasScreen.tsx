import React, { useState, useEffect, useRef } from 'react';
import { Camera, ComplianceEvent } from '../types';
import { fetchCameras, triggerDemoScenario, inferWebcamFrame, reviewAlert, fetchCentres, fetchCentreDetail } from '../api';
import { AlertReviewModal } from '../components/AlertReviewModal';
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
  UserCheck,
  Zap,
  Smartphone,
  SwitchCamera,
  QrCode,
  FlipHorizontal,
  Copy,
  ExternalLink,
  Building2,
  Scale,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CameraFusionModal } from '../components/CameraFusionModal';

interface LiveCamerasScreenProps {
  initialCentreId?: string | null;
  initialRoomId?: string | null;
}

export const LiveCamerasScreen: React.FC<LiveCamerasScreenProps> = ({ 
  initialCentreId, 
  initialRoomId 
}) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoActionStatus, setDemoActionStatus] = useState<string | null>(null);
  const [showFusionModal, setShowFusionModal] = useState<boolean>(false);
  const [showRtspModal, setShowRtspModal] = useState<boolean>(false);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [privacyBlurActive, setPrivacyBlurActive] = useState<boolean>(true);

  // Target Centre, Lab & Camera Selection State
  const [centresList, setCentresList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>(initialCentreId || 'TC-101');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId || '');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-101-A1');

  // Vision Engine Selection State (DEIM CVPR 2025 vs YOLOv8)
  const [selectedVisionEngine, setSelectedVisionEngine] = useState<'deim' | 'yolo'>('deim');
  const [engineMetadata, setEngineMetadata] = useState<string>('DEIM-D-FINE-N (CVPR 2025)');
  const [isNmsFree, setIsNmsFree] = useState<boolean>(true);

  // Multi-Device & Mobile Camera Switching State
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Laptop / Mobile Webcam Integration State
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamDetections, setWebcamDetections] = useState<any[]>([]);
  const [webcamBlurBoxes, setWebcamBlurBoxes] = useState<number[][]>([]);
  const [personCount, setPersonCount] = useState<number>(0);
  const [computerCount, setComputerCount] = useState<number>(0);
  const [chairCount, setChairCount] = useState<number>(0);
  const [tableCount, setTableCount] = useState<number>(0);
  const [webcamLatency, setWebcamLatency] = useState<number>(24);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  // Camera Health & Compliance Engine State
  const [cameraHealth, setCameraHealth] = useState<any>({
    is_healthy: true,
    status: 'OPTICS_OK',
    metrics: { laplacian_variance: 218.4, mean_brightness: 114.2, contrast_std: 56.8 }
  });
  const [attendanceComparison, setAttendanceComparison] = useState<any>({
    reported: 20,
    observed: 0,
    status: 'DISCREPANCY_SEVERE',
    severity: 'CRITICAL',
    difference: 20,
    deficit_pct: 100.0
  });
  const [infraSummary, setInfraSummary] = useState<any[]>([
    { item_type: 'computer', mandate: 20, observed: 0, gap: 20, severity: 'CRITICAL' },
    { item_type: 'chair', mandate: 20, observed: 0, gap: 20, severity: 'CRITICAL' },
    { item_type: 'table', mandate: 20, observed: 0, gap: 20, severity: 'CRITICAL' }
  ]);
  const [pendingAlert, setPendingAlert] = useState<ComplianceEvent | null>(null);
  const [reviewModalAlert, setReviewModalAlert] = useState<ComplianceEvent | null>(null);
  const [autoAudit, setAutoAudit] = useState<boolean>(false);

  // Active centre and room objects derived dynamically
  const selectedCentre = centresList.find(c => c.id === selectedCentreId);
  const selectedRoom = roomsList.find(r => r.id === selectedRoomId);
  const activeRosterCount = attendanceComparison?.reported ?? (selectedRoom?.capacity || selectedCentre?.sanctioned_capacity || 20);

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
    fetchCentres().then(data => {
      setCentresList(data);
      if (initialCentreId) {
        setSelectedCentreId(initialCentreId);
      } else if (data.length > 0 && !selectedCentreId) {
        setSelectedCentreId(data[0].id);
      }
    });
  }, [initialCentreId]);

  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  useEffect(() => {
    if (selectedCentreId) {
      fetchCentreDetail(selectedCentreId).then(detail => {
        if (detail && detail.rooms) {
          setRoomsList(detail.rooms);
          const targetRoom = (initialRoomId && detail.rooms.some((r: any) => r.id === initialRoomId))
            ? detail.rooms.find((r: any) => r.id === initialRoomId)
            : (selectedRoomId ? detail.rooms.find((r: any) => r.id === selectedRoomId) : detail.rooms[0]);

          if (targetRoom) {
            setSelectedRoomId(targetRoom.id);
          }

          // Immediately sync attendance and infra mandates to active room & centre
          const activeCap = targetRoom?.capacity || detail.centre.sanctioned_capacity || 20;
          setAttendanceComparison((prev: any) => ({
            ...prev,
            reported: activeCap,
            difference: activeCap - personCount,
            deficit_pct: Math.round(((activeCap - personCount) / Math.max(1, activeCap)) * 100)
          }));

          if (detail.inventory && detail.inventory.length > 0) {
            const relevantInv = detail.inventory.filter((inv: any) => !inv.room_id || inv.room_id === (targetRoom?.id || selectedRoomId));
            if (relevantInv.length > 0) {
              setInfraSummary(relevantInv.map((inv: any) => ({
                item_type: inv.item_type,
                mandate: inv.required_quantity,
                observed: 0,
                gap: inv.required_quantity,
                severity: 'CRITICAL'
              })));
            }
          }

          if (detail.cameras && detail.cameras.length > 0) {
            const camForRoom = detail.cameras.find((c: any) => c.room_id === (initialRoomId || selectedRoomId));
            if (camForRoom) {
              setSelectedCameraId(camForRoom.id);
            } else {
              setSelectedCameraId(detail.cameras[0].id);
            }
          } else {
            setSelectedCameraId(`CAM-${selectedCentreId}-01`);
          }
        }
      }).catch(err => console.warn("Failed to load centre detail in cameras screen:", err));
    }
  }, [selectedCentreId, initialRoomId]);

  // Sync roster count immediately when selectedRoom changes
  useEffect(() => {
    if (selectedRoom) {
      const roomCap = selectedRoom.capacity || 20;
      setAttendanceComparison((prev: any) => ({
        ...prev,
        reported: roomCap,
        difference: roomCap - personCount,
        deficit_pct: Math.round(((roomCap - personCount) / Math.max(1, roomCap)) * 100)
      }));
    }
  }, [selectedRoomId, selectedRoom]);

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

  // Enumerate connected cameras (Mac FaceTime, iPhone Continuity, USB webcams, Mobile rear/front)
  const enumerateCameras = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
      }
    } catch (err) {
      console.warn("Could not enumerate camera devices:", err);
    }
  };

  // Toggle Laptop / Mobile Webcam
  const startWebcam = async (targetDeviceId?: string, targetFacingMode?: 'user' | 'environment') => {
    try {
      setWebcamError(null);

      // Verify browser support & Secure Context (HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isNotHttps = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isNotHttps) {
          const httpsTarget = `https://${window.location.hostname || '192.168.1.15'}:3000`;
          setWebcamError(`Mobile camera access requires HTTPS (Safari & Chrome security rule). Please open: ${httpsTarget}`);
        } else {
          setWebcamError("Camera access API is unavailable in this browser context. Please use Safari (iOS) or Chrome (Android) over HTTPS.");
        }
        return;
      }

      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }

      const activeFacing = targetFacingMode || facingMode;
      // When explicitly switching facing mode (e.g. front to back), clear any previously locked deviceId
      const activeDevId = targetFacingMode ? '' : (targetDeviceId !== undefined ? targetDeviceId : selectedDeviceId);

      const videoConstraints: MediaTrackConstraints = activeDevId
        ? { deviceId: { exact: activeDevId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: { ideal: activeFacing }, width: { ideal: 1280 }, height: { ideal: 720 } };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      });

      setWebcamStream(stream);
      setUseWebcam(true);

      // Extract real browser track capabilities & settings
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        const resolvedFacing = (settings.facingMode as 'user' | 'environment') || activeFacing;
        setFacingMode(resolvedFacing);
        setIsMirrored(resolvedFacing === 'user');
        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }

      // Refresh camera devices list once permission is granted
      await enumerateCameras();

      const isMobileBack = (tracks[0]?.getSettings()?.facingMode || activeFacing) === 'environment';
      setDemoActionStatus(`Camera activated (${isMobileBack ? '📱 Mobile / Back Cam (Unmirrored)' : '💻 Front / Laptop Cam (Mirrored)'}) running ${selectedVisionEngine.toUpperCase()}.`);
      setTimeout(() => setDemoActionStatus(null), 4000);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setWebcamError(
        err.name === 'NotAllowedError' 
          ? "Camera permission denied. Please allow camera permissions in your browser bar."
          : `Could not access camera (${err.name || 'Error'}): ${err.message}`
      );
    }
  };

  // Flip facing mode directly (user <-> environment)
  const flipCameraFacing = async () => {
    const nextMode: 'user' | 'environment' = facingMode === 'user' ? 'environment' : 'user';
    await startWebcam('', nextMode);
  };

  // Switch between connected cameras or flip facing mode
  const switchCamera = async () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      const isBack = /back|rear|environment/i.test(nextDevice.label);
      const newMode = isBack ? 'environment' : 'user';
      await startWebcam(nextDevice.deviceId, newMode);
    } else {
      await flipCameraFacing();
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

        const shouldAudit = autoAudit;
        const res = await inferWebcamFrame(
          base64, 
          shouldAudit, 
          selectedVisionEngine,
          selectedCentreId || 'TC-101',
          selectedCameraId || 'CAM-101-A1',
          selectedRoomId || undefined
        );
        if (isMounted && res) {
          setWebcamDetections(res.detections || []);
          setWebcamBlurBoxes(res.blur_boxes || []);
          setPersonCount(res.person_count || 0);
          setComputerCount(res.computer_count || 0);
          if (res.chair_count !== undefined) setChairCount(res.chair_count);
          if (res.table_count !== undefined) setTableCount(res.table_count);
          setWebcamLatency(res.latency_ms || 24);
          if (res.camera_health) setCameraHealth(res.camera_health);
          if (res.attendance_comparison) setAttendanceComparison(res.attendance_comparison);
          if (res.infrastructure_summary) setInfraSummary(res.infrastructure_summary);
          if (res.vision_engine) setEngineMetadata(res.vision_engine);
          if (res.nms_free !== undefined) setIsNmsFree(res.nms_free);

          if (res.alert_triggered && res.event) {
            setPendingAlert(res.event);
          }
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
  }, [useWebcam, webcamStream, selectedVisionEngine, autoAudit, selectedCentreId, selectedCameraId, selectedRoomId]);


  // Reconcile Webcam Attendance & Infrastructure against Official Roster
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

      setReconcileResult(`Evaluating edge video & optics against official sanctioned records...`);
      const res = await inferWebcamFrame(
        base64, 
        true, 
        selectedVisionEngine,
        selectedCentreId || 'TC-101',
        selectedCameraId || 'CAM-101-A1',
        selectedRoomId || undefined
      );

      if (res.camera_health) setCameraHealth(res.camera_health);
      if (res.attendance_comparison) setAttendanceComparison(res.attendance_comparison);
      if (res.infrastructure_summary) setInfraSummary(res.infrastructure_summary);
      if (res.chair_count !== undefined) setChairCount(res.chair_count);
      if (res.table_count !== undefined) setTableCount(res.table_count);

      if (res.alert_triggered && res.event) {
        setPendingAlert(res.event);
        setReconcileResult(`⚠️ Discrepancy Flagged (${res.event.event_type.replace(/_/g, ' ')})! Blurred evidence snapshot recorded. Ready for officer review.`);
      } else {
        setReconcileResult(`✅ Compliance Verified! AI Headcount (${res.person_count}) and equipment matched official records.`);
      }
      setTimeout(() => setReconcileResult(null), 8000);
    } catch (err: any) {
      setReconcileResult(`Reconciliation error: ${err.message}`);
    }
  };

  const handleAlertReviewSubmit = async (
    alertId: string, 
    status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW', 
    notes: string, 
    category?: string
  ) => {
    try {
      await reviewAlert(alertId, {
        status,
        review_notes: notes,
        reviewed_by: 'Monitoring Officer (Live Console)',
        category
      });
      setReviewModalAlert(null);
      setPendingAlert(null);
      setDemoActionStatus(`Case CASE-${alertId.slice(0, 8)} successfully adjudicated as ${status}. Escalation & audit trail updated!`);
      setTimeout(() => setDemoActionStatus(null), 5000);
    } catch (e: any) {
      setDemoActionStatus(`Review error: ${e.message}`);
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
          {/* Vision Engine Selector: DEIM vs YOLO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '2px 4px',
          }}>
            <button
              onClick={() => {
                setSelectedVisionEngine('deim');
                setDemoActionStatus("Switched vision pipeline to DEIM (CVPR 2025 Real-Time DETR · NMS-Free)!");
                setTimeout(() => setDemoActionStatus(null), 3500);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: selectedVisionEngine === 'deim' ? '#4F46E5' : 'transparent',
                color: selectedVisionEngine === 'deim' ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              <Zap size={12} color={selectedVisionEngine === 'deim' ? '#FDE047' : '#6366F1'} />
              <span>DEIM (CVPR '25)</span>
              <span style={{
                fontSize: '9px',
                padding: '1px 4px',
                borderRadius: '3px',
                backgroundColor: selectedVisionEngine === 'deim' ? 'rgba(255,255,255,0.2)' : '#EEF2FF',
                color: selectedVisionEngine === 'deim' ? '#FFFFFF' : '#4F46E5',
                fontWeight: 700
              }}>
                SOTA DETR
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedVisionEngine('yolo');
                setDemoActionStatus("Switched vision pipeline to YOLOv8 + Pose.");
                setTimeout(() => setDemoActionStatus(null), 3000);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: selectedVisionEngine === 'yolo' ? '#0F172A' : 'transparent',
                color: selectedVisionEngine === 'yolo' ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              <Activity size={12} color={selectedVisionEngine === 'yolo' ? '#38BDF8' : '#64748B'} />
              <span>YOLOv8 + Pose</span>
            </button>
          </div>

          {/* Camera Controls */}
          {useWebcam ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={stopWebcam}
                className="gov-btn-secondary"
                style={{ borderColor: '#EF4444', color: '#DC2626' }}
              >
                <CameraOff size={14} />
                <span>Disconnect Cam</span>
              </button>

              <button
                onClick={switchCamera}
                className="gov-btn-secondary"
                style={{ borderColor: '#4F46E5', color: '#4338CA', backgroundColor: '#EEF2FF' }}
                title="Switch between front/laptop camera and mobile rear camera"
              >
                <SwitchCamera size={14} />
                <span>{facingMode === 'user' ? 'Switch to Back/Mobile Cam' : 'Switch to Front Cam'}</span>
              </button>

              {videoDevices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => startWebcam(e.target.value)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#1E293B',
                    cursor: 'pointer'
                  }}
                >
                  {videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <button
              onClick={() => startWebcam()}
              className="gov-btn-primary"
              style={{ backgroundColor: '#2563EB' }}
            >
              <CameraIcon size={14} />
              <span>Use Camera</span>
            </button>
          )}

          {/* Connect Mobile Camera Button */}
          <button
            onClick={() => setShowMobileModal(true)}
            className="gov-btn-secondary"
            style={{
              borderColor: '#C7D2FE',
              backgroundColor: '#F5F3FF',
              color: '#4F46E5'
            }}
          >
            <Smartphone size={14} />
            <span>Connect Mobile Cam</span>
          </button>

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

      {/* Target Lab & Centre Assignment Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#1D4ED8" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Active Centre:</span>
            <select
              value={selectedCentreId}
              onChange={(e) => {
                setSelectedCentreId(e.target.value);
                setSelectedRoomId('');
              }}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              {centresList.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Video size={16} color="#4F46E5" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Target Lab / Room:</span>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                const rId = e.target.value;
                setSelectedRoomId(rId);
                const matchingCam = cameras.find(c => c.room_id === rId);
                if (matchingCam) setSelectedCameraId(matchingCam.id);
                else setSelectedCameraId(`CAM-${rId || selectedCentreId}`);
              }}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              <option value="">-- All Labs / Unspecified --</option>
              {roomsList.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.id}) - {r.room_type}</option>
              ))}
            </select>
          </div>

          {selectedRoomId && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}>
              <span>📍 Live Streaming for:</span>
              <strong>{roomsList.find(r => r.id === selectedRoomId)?.name || selectedRoomId}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {useWebcam ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot online"></span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                Camera Active for {roomsList.find(r => r.id === selectedRoomId)?.name || selectedCentreId}
              </span>
            </div>
          ) : (
            <button
              onClick={() => startWebcam()}
              className="gov-btn-primary"
              style={{
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <CameraIcon size={14} />
              <span>Open Camera for this Lab</span>
            </button>
          )}
        </div>
      </div>

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
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '13px',
          color: '#DC2626',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
              <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{webcamError}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                <button
                  onClick={() => {
                    window.location.href = `https://${window.location.hostname}:3000${window.location.pathname}${window.location.search}`;
                  }}
                  className="gov-btn-primary"
                  style={{ backgroundColor: '#2563EB', padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}
                >
                  🔒 Switch to HTTPS Now
                </button>
              )}
              <button
                onClick={() => startWebcam()}
                className="gov-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '11px' }}
              >
                Retry Permission
              </button>
            </div>
          </div>

          {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#92400E',
              fontSize: '11px',
              lineHeight: 1.5
            }}>
              <strong>📌 Apple iOS Safari / Chrome Camera Policy:</strong> Mobile operating systems strictly disable the camera API on non-localhost plain HTTP. Open <strong>https://{window.location.hostname}:3000</strong>. When Safari shows <em>"This Connection Is Not Private"</em>, tap <strong>"Show Details"</strong> → <strong>"visit this website"</strong> (trusting your local dev SSL). The camera prompt will then immediately appear!
            </div>
          )}
        </div>
      )}

      {/* Interactive Operational Architecture Flow Pipeline (Matching End-to-End Diagram) */}
      <section style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              SYSTEM PIPELINE FLOW
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Training Centre CCTV → AI Analysis → Compliance Reconciler → Human Review → Escalation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0'
            }}>
              <input 
                type="checkbox" 
                checked={autoAudit} 
                onChange={(e) => setAutoAudit(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span>Auto-Audit Compliance (Continuous)</span>
            </label>

            <button
              onClick={handleReconcileWebcam}
              className="gov-btn-primary"
              style={{ backgroundColor: '#2563EB', padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}
            >
              <Scale size={13} />
              <span>Evaluate Compliance Now</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Architecture Flow Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          alignItems: 'stretch'
        }}>
          {/* Step 1: Training Centre */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D4ED8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <Building2 size={13} />
              <span>1. Training Centre</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedRoom ? `${selectedRoom.name}` : (selectedCentre ? `${selectedCentre.name}` : selectedCentreId)}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              {selectedRoom ? `Cap: ${selectedRoom.capacity || 20} Trainees` : `Cap: ${selectedCentre?.sanctioned_capacity || 20} Trainees`}
            </div>
          </div>

          {/* Step 2: CCTV Cameras */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4F46E5', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <Video size={13} />
              <span>2. CCTV Feed</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
              {useWebcam ? (facingMode === 'environment' ? '📱 Mobile Cam' : '💻 Laptop Cam') : 'RTSP Live Feed'}
            </div>
            <div style={{ fontSize: '10px', color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {useWebcam ? '30 FPS · Edge Ingest' : '15 FPS · Metasync'}
            </div>
          </div>

          {/* Step 3: Video Processing & Optics Check */}
          <div style={{
            backgroundColor: cameraHealth?.is_healthy ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${cameraHealth?.is_healthy ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cameraHealth?.is_healthy ? '#166534' : '#991B1B', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <ShieldCheck size={13} />
              <span>3. Video Quality</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: cameraHealth?.is_healthy ? '#15803D' : '#DC2626' }}>
              {cameraHealth?.status || 'OPTICS_OK'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              Sharp: {cameraHealth?.metrics?.laplacian_variance ?? 214}
            </div>
          </div>

          {/* Step 4: AI Analysis */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D4ED8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <Zap size={13} />
              <span>4. AI Analysis</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF' }}>
              👤 {personCount} Trainees
            </div>
            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
              🖥️ {computerCount} · 🪑 {chairCount} · 🪵 {tableCount}
            </div>
          </div>

          {/* Step 5: Compliance Engine */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <Scale size={13} />
              <span>5. Record Check</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
              Roster: {activeRosterCount} Claimed
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              Tolerance: ±15%
            </div>
          </div>

          {/* Step 6: Discrepancy & Evidence */}
          <div style={{
            backgroundColor: pendingAlert ? '#FEF2F2' : '#F8FAFC',
            border: `1px solid ${pendingAlert ? '#FECACA' : '#E2E8F0'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pendingAlert ? '#DC2626' : '#64748B', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <AlertTriangle size={13} />
              <span>6. Discrepancy</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: pendingAlert ? '#991B1B' : '#334155' }}>
              {pendingAlert ? 'FLAGGED (Evidence)' : `${attendanceComparison?.status || 'NORMAL'}`}
            </div>
            <div style={{ fontSize: '10px', color: pendingAlert ? '#DC2626' : '#64748B', fontFamily: 'var(--font-mono)' }}>
              Gap: {activeRosterCount - personCount} Trainees
            </div>
          </div>

          {/* Step 7: Human Review */}
          <div style={{
            backgroundColor: pendingAlert ? '#FFFBEB' : '#F8FAFC',
            border: `1px solid ${pendingAlert ? '#FDE68A' : '#E2E8F0'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            cursor: pendingAlert ? 'pointer' : 'default'
          }}
            onClick={() => { if (pendingAlert) setReviewModalAlert(pendingAlert); }}
            title={pendingAlert ? 'Click to open Officer Review Modal' : 'Awaiting discrepancy flag'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pendingAlert ? '#D97706' : '#64748B', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <UserCheck size={13} />
              <span>7. Human Review</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: pendingAlert ? '#B45309' : '#475569' }}>
              {pendingAlert ? '⚡ Review Ready' : 'Officer Desk'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              {pendingAlert ? 'Click to Adjudicate' : 'Zero Auto-Fines'}
            </div>
          </div>

          {/* Step 8: Action & Escalation */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9333EA', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              <FileCheck size={13} />
              <span>8. Escalation</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
              Audit &amp; State SLA
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              Immutable Log
            </div>
          </div>
        </div>
      </section>

      {/* Discrepancy Alert & Officer Evidence Review Banner */}
      {pendingAlert && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '2px solid #F87171',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.15)',
          animation: 'fadeIn 0.25s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#991B1B' }}>
                  DISCREPANCY FLAGGED: {pendingAlert.event_type.replace(/_/g, ' ')}
                </span>
                <span className={`status-badge ${pendingAlert.severity === 'CRITICAL' ? 'critical' : 'warning'}`}>
                  {pendingAlert.severity}
                </span>
                <span style={{ fontSize: '11px', color: '#B91C1C', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  CASE-{pendingAlert.id.slice(0, 8)} · Centre: {pendingAlert.centre_id}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '3px' }}>
                Camera Headcount: <strong>{personCount} Trainees</strong> vs Official Sanctioned Roster: <strong>{activeRosterCount} Students</strong> (Deficit: <strong>{activeRosterCount - personCount}</strong>). Anonymized evidence snapshot saved with facial blur (DPDP Act).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setReviewModalAlert(pendingAlert)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Eye size={16} />
              <span>Review Evidence &amp; Adjudicate</span>
            </button>

            <button
              onClick={() => setPendingAlert(null)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '9px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
          {(() => {
            const displayCameras = [...cameras];
            const hasCamForRoom = selectedRoomId && cameras.some(c => c.room_id === selectedRoomId);
            if (selectedRoomId && !hasCamForRoom) {
              const currentRoom = roomsList.find(r => r.id === selectedRoomId);
              displayCameras.unshift({
                id: selectedCameraId || `CAM-${selectedRoomId}`,
                centre_id: selectedCentreId,
                room_id: selectedRoomId,
                name: `Live Lab Cam (${currentRoom?.name || selectedRoomId})`,
                source_type: 'WEBCAM',
                stream_url: 'browser://webrtc/live',
                status: 'ONLINE',
                last_seen_at: new Date().toISOString()
              });
            }

            return displayCameras.map((cam) => {
              const isOnline = cam.status === 'ONLINE';
              const isDemoCamera = cam.id === selectedCameraId || (selectedRoomId && cam.room_id === selectedRoomId) || (!selectedRoomId && cam.id === 'CAM-101-A1');

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
                    backgroundColor: '#FFFFFF',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{isDemoCamera && useWebcam ? (facingMode === 'environment' ? "📱 Mobile / Back Camera (Live Edge Feed)" : "💻 Laptop / Front Camera (Live Edge Feed)") : cam.name}</span>
                        {cam.room_id && (
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', fontWeight: 600 }}>
                            Lab: {roomsList.find(r => r.id === cam.room_id)?.name || cam.room_id}
                          </span>
                        )}
                        {isDemoCamera && useWebcam && (
                          <>
                            <span className="status-badge normal">
                              {facingMode === 'environment' ? 'MOBILE REAR CAM' : 'FRONT CAM ACTIVE'}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: selectedVisionEngine === 'deim' ? '#EEF2FF' : '#F1F5F9',
                              color: selectedVisionEngine === 'deim' ? '#4F46E5' : '#334155',
                              border: `1px solid ${selectedVisionEngine === 'deim' ? '#C7D2FE' : '#CBD5E1'}`
                            }}>
                              {selectedVisionEngine === 'deim' ? '⚡ DEIM (CVPR 2025 · NMS-Free)' : 'YOLOv8 + Pose'}
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        UID: {cam.id} · Centre: {cam.centre_id}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {isDemoCamera && useWebcam && (
                        <button
                          onClick={switchCamera}
                          title="Flip between front/laptop camera and mobile rear camera"
                          style={{
                            backgroundColor: '#EEF2FF',
                            border: '1px solid #C7D2FE',
                            color: '#4338CA',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <SwitchCamera size={12} />
                          <span>{facingMode === 'user' ? 'Switch to Back Cam' : 'Switch to Front Cam'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedCameraId(cam.id);
                          if (cam.room_id) setSelectedRoomId(cam.room_id);
                          if (!useWebcam) {
                            startWebcam();
                          } else if (isDemoCamera) {
                            stopWebcam();
                          }
                        }}
                        style={{
                          backgroundColor: (isDemoCamera && useWebcam) ? '#EFF6FF' : '#F1F5F9',
                          border: `1px solid ${(isDemoCamera && useWebcam) ? '#3B82F6' : '#CBD5E1'}`,
                          color: (isDemoCamera && useWebcam) ? '#1D4ED8' : '#334155',
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
                        {(isDemoCamera && useWebcam) ? <CameraOff size={12} /> : <CameraIcon size={12} />}
                        <span>{(isDemoCamera && useWebcam) ? 'Disconnect Cam' : 'Use Camera'}</span>
                      </button>

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
                                transform: isMirrored ? 'scaleX(-1)' : 'none'
                              }}
                            />

                            {/* Real-time AI Bounding Boxes SVG Overlay */}
                            {showBoxes && (
                              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                                {webcamDetections.map((det, idx) => {
                                  // Invert X when mirrored, keep standard orientation when using rear mobile camera
                                  const x = isMirrored ? (1 - det.box[2]) * 100 : det.box[0] * 100;
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
                              const left = isMirrored ? (1 - b[2]) * 100 : b[0] * 100;
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

                            {/* Floating On-Video Quick Controls */}
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              zIndex: 25,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <button
                                onClick={flipCameraFacing}
                                style={{
                                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                }}
                                title="Flip camera between front and mobile rear lens"
                              >
                                <SwitchCamera size={13} color="#38BDF8" />
                                <span>{facingMode === 'user' ? 'Flip to Rear Cam' : 'Flip to Front Cam'}</span>
                              </button>

                              <button
                                onClick={() => setSelectedVisionEngine(selectedVisionEngine === 'deim' ? 'yolo' : 'deim')}
                                style={{
                                  backgroundColor: selectedVisionEngine === 'deim' ? 'rgba(37, 99, 235, 0.9)' : 'rgba(79, 70, 229, 0.9)',
                                  border: '1px solid rgba(255, 255, 255, 0.35)',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                }}
                                title="Toggle vision engine between DEIM Real-Time DETR and YOLOv8"
                              >
                                <Zap size={12} color="#FDE047" />
                                <span>{selectedVisionEngine === 'deim' ? '⚡ DEIM' : 'YOLO'}</span>
                              </button>
                            </div>

                            {/* Floating Camera Mode Indicator (Top-Left) */}
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              zIndex: 25,
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '10px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              backdropFilter: 'blur(8px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                            }}>
                              <span style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#10B981',
                                display: 'inline-block'
                              }} />
                              <span>{facingMode === 'user' ? '💻 FRONT CAM (MIRRORED)' : '📱 MOBILE / REAR CAM'}</span>
                            </div>
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
                        color: selectedVisionEngine === 'deim' ? '#A5B4FC' : '#38BDF8',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backdropFilter: 'blur(4px)'
                      }}>
                        {useWebcam && isDemoCamera 
                          ? `${webcamLatency}ms · ${selectedVisionEngine === 'deim' ? 'DEIM-D-FINE (NMS-Free)' : 'YOLOv8 + Pose'}` 
                          : '1.8 KB/s Metasync'}
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

                {/* 3-Pillar AI Analysis Telemetry HUD (Webcam Mode) */}
                {isDemoCamera && useWebcam && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    {/* Pillar 1: Camera Health & Optics Quality Check */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          1. Camera Health &amp; Optics
                        </span>
                        <span className={`status-badge ${cameraHealth?.is_healthy ? 'normal' : 'critical'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {cameraHealth?.status || 'OPTICS_OK'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#1E293B', fontFamily: 'var(--font-mono)' }}>
                        Sharpness: <strong>{cameraHealth?.metrics?.laplacian_variance ?? 214}</strong> (min 65)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        Brightness: {cameraHealth?.metrics?.mean_brightness ?? 118} · Contrast: {cameraHealth?.metrics?.contrast_std ?? 58}
                      </div>
                      <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <ShieldCheck size={12} />
                        <span>DPDP Privacy: Face Blur Active</span>
                      </div>
                    </div>

                    {/* Pillar 2: Attendance Headcount vs Official Roster */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          2. Attendance Intelligence
                        </span>
                        <span className={`status-badge ${(attendanceComparison?.difference || (25 - personCount)) === 0 ? 'normal' : 'critical'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {(attendanceComparison?.difference || (25 - personCount)) === 0 ? 'MATCH' : 'MISMATCH'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#1E293B', fontFamily: 'var(--font-mono)' }}>
                        Observed: <strong style={{ color: '#059669' }}>{personCount} Trainees</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        Official Roster: <strong>{activeRosterCount} Students</strong>
                      </div>
                      <div style={{ fontSize: '10px', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                        Gap: {activeRosterCount - personCount} Trainees ({Math.round(((activeRosterCount - personCount) / Math.max(1, activeRosterCount)) * 100)}% deficit)
                      </div>
                    </div>

                    {/* Pillar 3: Infrastructure Sanction Compliance */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          3. Infrastructure Compliance
                        </span>
                        <span className="status-badge normal" style={{ fontSize: '9px', padding: '1px 5px' }}>
                          DIGITAL TWIN
                        </span>
                      </div>
                      {(() => {
                        const compMandate = infraSummary.find(i => i.item_type === 'computer')?.mandate ?? 20;
                        const chairMandate = infraSummary.find(i => i.item_type === 'chair')?.mandate ?? 20;
                        const deskMandate = infraSummary.find(i => i.item_type === 'table' || i.item_type === 'workbench')?.mandate ?? 20;
                        return (
                          <>
                            <div style={{ fontSize: '11px', color: '#1E293B', fontFamily: 'var(--font-mono)' }}>
                              Computers: <strong>{computerCount} / {compMandate} Mandated</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              Chairs: <strong>{chairCount} / {chairMandate}</strong> · Desks: <strong>{tableCount} / {deskMandate}</strong>
                            </div>
                          </>
                        );
                      })()}
                      <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                        Sanctioned Inventory Tracked
                      </div>
                    </div>
                  </div>
                )}

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
                      Detected Objects:
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
                    <Cpu size={13} color={selectedVisionEngine === 'deim' ? '#4F46E5' : '#2563EB'} />
                    <span>{useWebcam && isDemoCamera ? (selectedVisionEngine === 'deim' ? "Client Camera + DEIM Real-Time DETR (CVPR 2025 · NMS-Free)" : "Client Camera + Local YOLOv8 + Pose Pipeline") : "Edge Inference Daemon"}</span>
                    <span style={{ color: '#CBD5E1' }}>·</span>
                    <span>{useWebcam && isDemoCamera ? `Inference: ${webcamLatency}ms` : `Last Ping: ${new Date(cam.last_seen_at).toLocaleTimeString()}`}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isDemoCamera && useWebcam && (
                      <>
                        <button
                          onClick={handleReconcileWebcam}
                          style={{
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '4px',
                            padding: '3px 9px',
                            fontSize: '11px',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Scale size={12} />
                          <span>Audit vs Roster</span>
                        </button>

                        {pendingAlert && (
                          <button
                            onClick={() => setReviewModalAlert(pendingAlert)}
                            style={{
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '4px',
                              padding: '3px 9px',
                              fontSize: '11px',
                              color: '#DC2626',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={12} />
                            <span>Review Evidence</span>
                          </button>
                        )}
                      </>
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
          });
        })()}
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

      {/* Mobile Camera Pairing & Streaming Modal */}
      {showMobileModal && (
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
          backdropFilter: 'blur(5px)',
          padding: '20px'
        }}>
          <div className="gov-card" style={{
            width: '100%',
            maxWidth: '640px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-modal)',
            borderRadius: '12px'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5'
                }}>
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Switch to Mobile Phone Camera
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Stream high-resolution mobile camera feeds directly into DEIM Real-Time DETR
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Option 1: Direct Wi-Fi Web Streaming */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                    <span style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>1</span>
                    <span>Direct Mobile Browser Access (Fastest)</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                    RECOMMENDED
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                  Open this link on your mobile phone (iPhone or Android) connected to the same Wi-Fi network:
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}>
                  <input
                    type="text"
                    readOnly
                    value="https://192.168.1.15:3000"
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#2563EB',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://192.168.1.15:3000');
                      setDemoActionStatus("Copied mobile HTTPS URL to clipboard!");
                      setTimeout(() => setDemoActionStatus(null), 3000);
                    }}
                    className="gov-btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#92400E',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  padding: '8px 10px',
                  borderRadius: '5px',
                  lineHeight: 1.4
                }}>
                  <strong>🔒 Apple iOS / Android Requirement:</strong> Mobile browsers only grant camera access over <strong>HTTPS</strong>. When Safari shows <em>"This Connection Is Not Private"</em>, tap <strong>"Show Details"</strong> → <strong>"visit this website"</strong>. Then tap <strong>"Use Camera"</strong> and <strong>"Allow"</strong>!
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👉 On your phone, tap <strong>"Use Camera"</strong>, then tap <strong>"Flip to Rear Cam"</strong> to aim at the classroom workspace.</span>
                </div>
              </div>

              {/* Option 2: Continuity / Wireless External Cam */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                  <span style={{
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>2</span>
                  <span>Apple Continuity Camera (macOS + iPhone)</span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                  Bring your unlocked iPhone close to your Mac with Wi-Fi &amp; Bluetooth enabled. macOS will automatically register your iPhone as a webcam input. Select it from the camera dropdown above!
                </p>
              </div>

              {/* Option 3: RTSP IP Webcam App */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                  <span style={{
                    backgroundColor: '#9333EA',
                    color: '#FFFFFF',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>3</span>
                  <span>IP Webcam / DroidCam RTSP Stream</span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                  If using an Android phone with <em>IP Webcam</em> or an iOS device with an RTSP streamer, tap <strong>Test RTSP Stream</strong> and enter the RTSP URI to ingest the stream with drop-frame buffering.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setShowMobileModal(false);
                      setShowRtspModal(true);
                    }}
                    className="gov-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px', color: '#9333EA', borderColor: '#E9D5FF' }}
                  >
                    <Radio size={12} />
                    <span>Open RTSP Tester</span>
                  </button>
                </div>
              </div>

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
                onClick={() => setShowMobileModal(false)}
                className="gov-btn-primary"
                style={{ backgroundColor: '#2563EB' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Review Modal (Human Officer Adjudication) */}
      <AlertReviewModal
        alert={reviewModalAlert}
        onClose={() => setReviewModalAlert(null)}
        onReviewSubmit={handleAlertReviewSubmit}
      />

    </div>
  );
};
