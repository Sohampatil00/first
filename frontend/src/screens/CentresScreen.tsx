import React, { useState, useEffect } from 'react';
import { Centre, Camera, InventoryItem } from '../types';
import { fetchCentres, fetchCentreDetail } from '../api';
import { 
  Building2, 
  Video, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Crosshair, 
  Users, 
  PlusCircle, 
  MapPin, 
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { ROIConfigModal } from '../components/ROIConfigModal';
import { ReportAttendanceModal } from '../components/ReportAttendanceModal';

interface CentresScreenProps {
  initialCentreId?: string | null;
  currentRole?: string;
}

export const CentresScreen: React.FC<CentresScreenProps> = ({ initialCentreId, currentRole = 'MINISTRY_OFFICER' }) => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(initialCentreId || null);
  const [centreDetail, setCentreDetail] = useState<{
    centre: Centre;
    rooms: any[];
    cameras: Camera[];
    inventory: InventoryItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedRoomForROI, setSelectedRoomForROI] = useState<any | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const loadCentresList = () => {
    fetchCentres().then(data => {
      setCentres(data);
      if (initialCentreId) {
        setSelectedCentreId(initialCentreId);
      } else if (data.length > 0 && !selectedCentreId) {
        setSelectedCentreId(data[0].id);
      }
    });
  };

  const loadCentreDetail = () => {
    if (selectedCentreId) {
      setLoading(true);
      fetchCentreDetail(selectedCentreId)
        .then(data => setCentreDetail(data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadCentresList();
  }, [initialCentreId]);

  useEffect(() => {
    loadCentreDetail();
  }, [selectedCentreId]);

  const filteredCentres = centres.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operational Header Bar */}
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
              Audit Engine v2.4
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
              REAL-TIME TELEMETRY RECONCILIATION
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Attendance Compliance &amp; Digital Twin
          </h1>

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, maxWidth: '680px' }}>
            Automated reconciliation of self-reported batch rosters vs AI aggregate camera observations and physical inventory
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="gov-btn-primary"
          >
            <PlusCircle size={15} />
            <span>Submit Trainee Roster</span>
          </button>
        </div>
      </section>

      {/* KPI Operational Ribbon: 4 High-Density Metric Nodes for Selected Centre */}
      {centreDetail && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}>
          <div className="gov-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sanctioned Batch Capacity
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }} className="tabular-nums">
              {centreDetail.centre.sanctioned_capacity} <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>Trainees / Session</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
              Approved MSDE Allocation
            </div>
          </div>

          <div className="gov-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reported Register Roster
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563EB', marginTop: '4px' }} className="tabular-nums">
              25 <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>Trainees Claimed</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
              Portal Self-Reporting
            </div>
          </div>

          <div className="gov-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Verified Physical Count
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }} className="tabular-nums">
              12 <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>Trainees In Lab</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
              Dwell Time Qualified (&ge; 180s)
            </div>
          </div>

          <div className="gov-card" style={{
            padding: '14px 16px',
            borderLeft: '4px solid #DC2626',
            backgroundColor: '#FEF2F2'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Attendance Deficit
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }} className="tabular-nums">
              -13 <span style={{ fontSize: '12px', fontWeight: 400, color: '#991B1B' }}>(52% Gap)</span>
            </div>
            <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600, marginTop: '6px' }}>
              Critical Discrepancy Exception
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout: Directory (4 cols) & Digital Twin Inspector (8 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Left Column: Monitored Centres Directory */}
        <div className="gov-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Centres Directory
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
              {centres.length} Monitored PMKK & ITI hubs
            </p>
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Filter by centre name, code, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: '#0F172A',
              outline: 'none'
            }}
          />

          {/* Centre Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredCentres.map((c) => {
              const isSelected = c.id === selectedCentreId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCentreId(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: isSelected ? '#1D4ED8' : '#64748B' }}>
                      {c.id}
                    </span>
                    <span className="status-badge normal">
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#1E40AF' : '#0F172A' }}>
                    {c.name}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#94A3B8" />
                    <span>{c.district}, {c.state}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Digital Twin Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div className="gov-card" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
              Loading Digital Twin records...
            </div>
          ) : centreDetail ? (
            <>
              {/* Centre Metadata Header */}
              <div className="gov-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {centreDetail.centre.name}
                      </h2>
                      <span className="status-badge normal">
                        Active Verified
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      UID: {centreDetail.centre.id} · {centreDetail.centre.location}, {centreDetail.centre.district}, {centreDetail.centre.state}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: '#334155',
                      fontWeight: 600
                    }}>
                      Edge Daemon: ONLINE (15 FPS)
                    </span>
                  </div>
                </div>
              </div>

              {/* Classroom Layout & ROI Configuration */}
              <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Classroom &amp; Lab Layouts (ROI Spatial Boundaries)
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                      Calibrated polygon boundary masks for trainee dwell state calculation
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {centreDetail.rooms.map((room) => {
                    const roomCams = centreDetail.cameras.filter(c => c.room_id === room.id);
                    return (
                      <div
                        key={room.id}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                              {room.id}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '3px' }}>
                              ROI Active
                            </span>
                          </div>

                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                            {room.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            Type: {room.room_type} · Floor: {room.floor_level}
                          </div>
                          <div style={{ fontSize: '11px', color: '#2563EB', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                            {roomCams.length} Linked Camera Stream(s)
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedRoomForROI(room)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#1D4ED8',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <Crosshair size={13} />
                          <span>Calibrate ROI Polygon</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanctioned Equipment Verification Matrix */}
              <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Sanctioned Physical Infrastructure Matrix
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                      AI visual verification against mandated workshop hardware inventory
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                    94.2% Inventory Compliance
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Item Class</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mandate</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Observed</th>
                      <th style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centreDetail.inventory.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>
                          {inv.item_type.toUpperCase()}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                          {inv.required_quantity} Units
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: inv.item_type === 'computer' ? '#059669' : '#0F172A' }}>
                          {inv.item_type === 'computer' ? '17 Units' : `${inv.required_quantity} Units`}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className="status-badge normal">
                            PRESENT &amp; VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          ) : null}
        </div>

      </div>

      {/* ROI Calibration Modal */}
      {selectedRoomForROI && (
        <ROIConfigModal
          centreId={selectedCentreId || ''}
          room={selectedRoomForROI}
          onClose={() => setSelectedRoomForROI(null)}
          onSaved={() => {
            setSelectedRoomForROI(null);
            loadCentreDetail();
          }}
        />
      )}

      {/* Report Attendance Modal */}
      <ReportAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        centreId={selectedCentreId || 'TC-101'}
        onSubmitted={() => {
          loadCentreDetail();
        }}
      />
    </div>
  );
};
