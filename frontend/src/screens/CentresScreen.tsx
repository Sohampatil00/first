import React, { useState, useEffect } from 'react';
import { Centre, Camera, InventoryItem } from '../types';
import { fetchCentres, fetchCentreDetail } from '../api';
import { Building, Video, Layers, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

interface CentresScreenProps {
  initialCentreId?: string | null;
}

export const CentresScreen: React.FC<CentresScreenProps> = ({ initialCentreId }) => {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(initialCentreId || null);
  const [centreDetail, setCentreDetail] = useState<{
    centre: Centre;
    rooms: any[];
    cameras: Camera[];
    inventory: InventoryItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCentres().then(data => {
      setCentres(data);
      if (initialCentreId) {
        setSelectedCentreId(initialCentreId);
      } else if (data.length > 0 && !selectedCentreId) {
        setSelectedCentreId(data[0].id);
      }
    });
  }, [initialCentreId]);

  useEffect(() => {
    if (selectedCentreId) {
      setLoading(true);
      fetchCentreDetail(selectedCentreId)
        .then(data => setCentreDetail(data))
        .finally(() => setLoading(false));
    }
  }, [selectedCentreId]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Training Centres & Digital Twin Registry
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Sanctioned capacity, room polygon ROIs, camera bindings, and physical asset inventories
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left List of Centres */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          height: 'fit-content'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 8px' }}>
            Registered Centres ({centres.length})
          </div>
          {centres.map((c) => {
            const isSelected = c.id === selectedCentreId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCentreId(c.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {c.id}
                  </span>
                  <span className={`status-badge ${c.status === 'ACTIVE' ? 'normal' : 'warning'}`}>
                    {c.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {c.district}, {c.state}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '24px'
        }}>
          {loading || !centreDetail ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading Digital Twin profile...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Centre Header */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      CENTRE IDENTIFIER: {centreDetail.centre.id}
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {centreDetail.centre.name}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {centreDetail.centre.location}, {centreDetail.centre.district}, {centreDetail.centre.state}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {centreDetail.centre.sanctioned_capacity}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sanctioned Trainees</div>
                  </div>
                </div>
              </div>

              {/* Mapped Rooms & Zones */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="var(--accent-cyan)" />
                  <span>Mapped Rooms & Calibration Zones ({centreDetail.rooms.length})</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {centreDetail.rooms.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No rooms configured.</div>
                  ) : (
                    centreDetail.rooms.map((room) => (
                      <div key={room.id} style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '14px'
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{room.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>Type: {room.room_type}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Capacity: {room.capacity} | ROI: Configured Polygon
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sanctioned Inventory Baseline */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} color="var(--status-normal)" />
                  <span>Sanctioned Equipment Baseline ({centreDetail.inventory.length} items)</span>
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(10, 14, 23, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Equipment Class</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Required Count</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centreDetail.inventory.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {inv.item_type.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }} className="tabular-nums">
                          {inv.required_quantity} units
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className="status-badge normal">Active Mandate</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
