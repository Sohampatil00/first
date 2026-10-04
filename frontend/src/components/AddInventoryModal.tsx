import React, { useState } from 'react';
import { X, Box, Plus, CheckCircle2 } from 'lucide-react';
import { addInventoryItem } from '../api';

interface AddInventoryModalProps {
  isOpen: boolean;
  centreId: string;
  rooms: any[];
  onClose: () => void;
  onAdded: () => void;
}

const COMMON_INSTRUMENTS = [
  { id: 'computer', label: '🖥️ Computer / Desktop Terminal', defaultQty: 20 },
  { id: 'chair', label: '🪑 Trainee Workstation Chair', defaultQty: 25 },
  { id: 'table', label: '🪵 Training Workbench / Desk', defaultQty: 20 },
  { id: 'sewing_machine', label: '🧵 Apparel Sewing Machine', defaultQty: 15 },
  { id: 'lathe_machine', label: '⚙️ Mechanical Lathe Machine', defaultQty: 6 },
  { id: 'soldering_station', label: '🔌 Electronics Soldering Station', defaultQty: 12 },
  { id: 'multimeter', label: '⚡ Digital Multimeter / Test Kit', defaultQty: 15 },
  { id: 'projector', label: '📽️ Smart Classroom Projector', defaultQty: 1 }
];

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ isOpen, centreId, rooms, onClose, onAdded }) => {
  if (!isOpen) return null;

  const [itemType, setItemType] = useState('computer');
  const [customItemType, setCustomItemType] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState(20);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof COMMON_INSTRUMENTS[0]) => {
    setItemType(preset.id);
    setRequiredQuantity(preset.defaultQty);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = itemType === 'custom' ? customItemType.trim().toLowerCase() : itemType;
    if (!finalType) {
      setError('Please specify an equipment / instrument name');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addInventoryItem(centreId, {
        item_type: finalType,
        required_quantity: Number(requiredQuantity) || 1,
        room_id: selectedRoomId || undefined
      });
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add equipment mandate');
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
        maxWidth: '520px',
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
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Set Lab Equipment &amp; Instrument Mandate
              </h2>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Centre: <strong>{centreId}</strong> · Physical inventory target for AI detection
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

        {/* Quick Presets */}
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Standard Lab Equipment Types:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMMON_INSTRUMENTS.map((p) => {
              const active = itemType === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    border: active ? '1px solid #059669' : '1px solid #CBD5E1',
                    backgroundColor: active ? '#ECFDF5' : '#FFFFFF',
                    color: active ? '#065F46' : '#334155'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setItemType('custom')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: itemType === 'custom' ? 700 : 500,
                cursor: 'pointer',
                border: itemType === 'custom' ? '1px solid #2563EB' : '1px solid #CBD5E1',
                backgroundColor: itemType === 'custom' ? '#EFF6FF' : '#FFFFFF',
                color: itemType === 'custom' ? '#1D4ED8' : '#334155'
              }}
            >
              ➕ Custom Equipment...
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {itemType === 'custom' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Custom Instrument / Object Name
              </label>
              <input
                type="text"
                value={customItemType}
                onChange={(e) => setCustomItemType(e.target.value)}
                placeholder="e.g. 3d_printer, microscope, multimeter"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Required / Mandated Quantity
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(Number(e.target.value))}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                AI flags deficit if camera sees fewer
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Assigned Classroom / Lab
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF' }}
              >
                <option value="">Entire Centre (All Labs)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
            </div>
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
              style={{ backgroundColor: '#059669', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{submitting ? 'Saving...' : 'Set Instrument Mandate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
