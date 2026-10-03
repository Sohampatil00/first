import React, { useState } from 'react';
import { X, Send, CheckCircle, Calendar, Users, Clock } from 'lucide-react';
import { submitReportedAttendance } from '../api';

interface ReportAttendanceModalProps {
  centreId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ReportAttendanceModal: React.FC<ReportAttendanceModalProps> = ({ centreId, isOpen, onClose, onSubmitted }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [sessionDate, setSessionDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [reportedCount, setReportedCount] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReportedAttendance({
        centre_id: centreId,
        session_date: sessionDate,
        session_start: startTime,
        session_end: endTime,
        reported_count: reportedCount
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
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
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '520px',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
              backgroundColor: 'var(--status-normal-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-normal-text)'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Report Physical Attendance Roster
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Centre: {centreId} • Mandated Verification Record
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="gov-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="gov-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="gov-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Official Trainee Count Present
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={reportedCount}
              onChange={(e) => setReportedCount(parseInt(e.target.value) || 0)}
              className="gov-input"
              style={{ width: '100%', fontSize: '16px', fontWeight: 700 }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              This count will be reconciled directly against edge computer vision headcounts with ±15% thresholding.
            </span>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="gov-btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="gov-btn-primary"
            >
              {success ? <CheckCircle size={14} /> : <Send size={14} />}
              <span>{success ? 'Submitted!' : (submitting ? 'Submitting...' : 'Submit Session Attendance')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
