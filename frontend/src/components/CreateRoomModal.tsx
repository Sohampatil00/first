import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { createRoom } from '../api';

interface CreateRoomModalProps {
  isOpen: boolean;
  centreId: string;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, centreId, onClose, onCreated }) => {
  if (!isOpen) return null;

  const [id, setId] = useState(`${centreId}-ROOM-${Math.floor(Math.random() * 900 + 100)}`);
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('LAB');
  const [capacity, setCapacity] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a class/room name');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createRoom(centreId, {
        id: id.trim() || undefined,
        name: name.trim(),
        room_type: roomType,
        capacity: Number(capacity) || 25
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
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
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Add New Classroom or Lab
              </h2>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Centre: <strong>{centreId}</strong> · Spatial unit for CCTV &amp; capacity audit
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
              Class / Lab Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IT & Software Development Lab A"
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Facility Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                <option value="LAB">Computer / Technical Lab</option>
                <option value="WORKSHOP">Vocational Workshop</option>
                <option value="CLASSROOM">Theory Classroom</option>
                <option value="SEMINAR_HALL">Seminar Hall</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Student Capacity
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
              Room Identifier / Code
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. ROOM-101-C"
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            />
          </div>

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
              style={{ backgroundColor: '#4F46E5', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{submitting ? 'Adding...' : 'Add Room / Lab'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
