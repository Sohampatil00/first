import React, { useState } from 'react';
import { X, Building2, Plus, CheckCircle2 } from 'lucide-react';
import { createCentre } from '../api';

interface CreateCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCentreId: string) => void;
}

export const CreateCentreModal: React.FC<CreateCentreModalProps> = ({ isOpen, onClose, onCreated }) => {
  if (!isOpen) return null;

  const [id, setId] = useState('TC-104');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Uttarakhand');
  const [capacity, setCapacity] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !district.trim()) {
      setError('Please fill in Centre ID, Name, and District');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createCentre({
        id: id.trim().toUpperCase(),
        name: name.trim(),
        location: location.trim() || `${district}, ${state}`,
        district: district.trim(),
        state: state.trim(),
        sanctioned_capacity: Number(capacity) || 30
      });
      onCreated(id.trim().toUpperCase());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create centre');
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
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Register New Training Centre
              </h2>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Add approved PMKK / ITI institute to central monitoring network
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Centre UID
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. TC-104"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Centre Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Skill India PMKK Institute"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Dehradun / Jaipur"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttarakhand"
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Campus Address / Landmark
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Industrial Area Phase II"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                Capacity (Students)
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
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
              style={{ backgroundColor: '#2563EB', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{submitting ? 'Creating...' : 'Register Centre'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
