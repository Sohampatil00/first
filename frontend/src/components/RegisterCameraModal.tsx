import React, { useState } from 'react';
import { X, Camera as CameraIcon, Plus, Video } from 'lucide-react';
import { registerCamera } from '../api';

interface RegisterCameraModalProps {
  isOpen: boolean;
  centreId: string;
  roomId?: string;
  roomName?: string;
  onClose: () => void;
  onRegistered: () => void;
}

export const RegisterCameraModal: React.FC<RegisterCameraModalProps> = ({
  isOpen,
  centreId,
  roomId,
  roomName,
  onClose,
  onRegistered
}) => {
  if (!isOpen) return null;

  const defaultId = `${centreId}-CAM-${Math.floor(Math.random() * 900 + 100)}`;
  const [id, setId] = useState(defaultId);
  const [name, setName] = useState(roomName ? `${roomName} Primary Camera` : 'Lab Ingestion Camera');
  const [sourceType, setSourceType] = useState<'WEBCAM' | 'RTSP'>('WEBCAM');
  const [streamUrl, setStreamUrl] = useState('rtsp://admin:pass@192.168.1.100:554/live/ch0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) {
      setError('Please provide a Camera UID and Name');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await registerCamera({
        id: id.trim().toUpperCase(),
        centre_id: centreId,
        room_id: roomId || undefined,
        name: name.trim(),
        source_type: sourceType,
        stream_url: sourceType === 'RTSP' ? streamUrl.trim() : undefined
      });
      onRegistered();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register camera');
    } finally {
      setSubmitting(false);
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
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CameraIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Link CCTV / Camera Feed
              </h2>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Centre: <strong>{centreId}</strong> {roomId ? `· Room: ${roomId}` : ''}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
              Camera Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lab 1 Ceiling Angle"
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Camera UID
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. CAM-105-A1"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Source Stream Type
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                <option value="WEBCAM">Client Webcam / Mobile Phone</option>
                <option value="RTSP">Physical RTSP IP Camera</option>
              </select>
            </div>
          </div>

          {sourceType === 'RTSP' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                RTSP Stream URL
              </label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="rtsp://admin:pass@ip:554/live/ch0"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="gov-btn-secondary"
              style={{ padding: '7px 14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="gov-btn-primary"
              style={{ backgroundColor: '#2563EB', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{submitting ? 'Registering...' : 'Register Camera'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
