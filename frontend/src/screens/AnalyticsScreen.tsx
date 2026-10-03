import React, { useState, useEffect } from 'react';
import { AnalyticsOverview, ComplianceEvent } from '../types';
import { fetchReviewFeedback } from '../api';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsScreenProps {
  analytics: AnalyticsOverview | null;
  alerts: ComplianceEvent[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ analytics, alerts }) => {
  const [selectedRange, setSelectedRange] = useState<string>('7D');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  useEffect(() => {
    fetchReviewFeedback().then(data => setFeedbackList(data)).catch(() => {});
  }, []);


  // Compliance trend mock data points across 7 days
  const trendData = [
    { day: 'Mon', compliance: 94.2, alerts: 2 },
    { day: 'Tue', compliance: 91.8, alerts: 4 },
    { day: 'Wed', compliance: 88.5, alerts: 6 },
    { day: 'Thu', compliance: 93.1, alerts: 3 },
    { day: 'Fri', compliance: 95.0, alerts: 1 },
    { day: 'Sat', compliance: 96.4, alerts: 1 },
    { day: 'Sun', compliance: 92.4, alerts: 3 },
  ];

  // State-wise performance breakdown
  const regionalPerformance = [
    { state: 'Maharashtra', centres: 1, compliance: '91.5%', status: 'Compliant' },
    { state: 'Delhi NCT', centres: 1, compliance: '94.8%', status: 'High Compliance' },
    { state: 'Jharkhand', centres: 1, compliance: '78.2%', status: 'Action Required' },
  ];

  const handleExportCSV = () => {
    // Generate clean CSV report for government compliance audits
    const headers = ["Alert_ID", "Centre_ID", "Camera_ID", "Event_Type", "Severity", "Confidence", "Status", "Timestamp"];
    const rows = alerts.map(a => [
      a.id,
      a.centre_id,
      a.camera_id || "N/A",
      a.event_type,
      a.severity,
      a.confidence,
      a.status,
      a.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MSDE_Compliance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div>
      {/* Title & Export Button */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            National Analytics & Compliance Intelligence
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Longitudinal attendance integrity, asset availability curves, and district performance benchmarks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Time Filter */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '2px'
          }}>
            {['24H', '7D', '30D', 'QTD'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                style={{
                  backgroundColor: selectedRange === r ? 'var(--bg-card-hover)' : 'transparent',
                  color: selectedRange === r ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: 'var(--accent-blue)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Download size={14} />
            <span>Export Official Audit CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '10px 16px',
          marginBottom: '20px',
          color: 'var(--status-normal)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>Official MSDE Compliance Report downloaded successfully.</span>
        </div>
      )}

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Attendance Compliance Trend Chart */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                7-Day National Attendance Compliance Trend
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Observed vs Sanctioned presence within ±15% tolerance
              </span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--status-normal)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={16} />
              +2.3% this week
            </span>
          </div>

          {/* Clean CSS SVG Bar Chart */}
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px'
          }}>
            {trendData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginBottom: '4px', fontWeight: 600 }}>
                  {d.compliance}%
                </span>
                <div style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${(d.compliance - 75) * 4}%`,
                  backgroundColor: d.compliance > 92 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(245, 158, 11, 0.7)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Target Benchmark: 90.0%</span>
            <span>Average Observed: 93.1%</span>
          </div>
        </div>

        {/* Discrepancy Breakdown by Category */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Discrepancy Taxonomy
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Distribution of flagged exceptions
            </span>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Attendance Deficit (&gt; 15% gap)</span>
                  <span style={{ fontWeight: 600, color: 'var(--status-critical)' }}>55%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '55%', height: '100%', backgroundColor: 'var(--status-critical)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Missing Sanctioned Equipment</span>
                  <span style={{ fontWeight: 600, color: 'var(--status-warning)' }}>30%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '30%', height: '100%', backgroundColor: 'var(--status-warning)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Camera Heartbeat Dropout</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>15%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: 'var(--accent-cyan)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-secondary)'
          }}>
            Average Resolution Time by Officers: <strong style={{ color: 'var(--accent-cyan)' }}>14.2 minutes</strong>
          </div>
        </div>

      </div>

      {/* Regional Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            State-Level Compliance Leaderboard
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(10, 14, 23, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>State / Union Territory</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Monitored Hubs</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>7-Day Compliance Avg</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status Rating</th>
            </tr>
          </thead>
          <tbody>
            {regionalPerformance.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.state}</td>
                <td style={{ padding: '14px 16px' }}>{r.centres} Centres</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }} className="tabular-nums">{r.compliance}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`status-badge ${r.status === 'High Compliance' ? 'normal' : (r.status === 'Compliant' ? 'info' : 'warning')}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Human Review Feedback & Active Learning Calibration Dataset (Roadmap Phases 12, 19, 20) */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginTop: '20px'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
              <span>Human-in-the-Loop Active Learning & Calibration Dataset</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Officer adjudication feedback annotated with root-cause classifications to fine-tune edge AI weights and dwell thresholds
            </p>
          </div>

          <a
            href="/api/alerts/feedback/export-csv"
            download="centrewatch_active_learning_feedback.csv"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: 'var(--accent-cyan)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Download Calibration CSV</span>
          </a>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(10, 14, 23, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Feedback ID</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Centre & Officer</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Decision</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Root-Cause Category</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Model Recalibration Action</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No reviewer feedback records logged yet. Review an alert to generate active learning annotations.
                </td>
              </tr>
            ) : (
              feedbackList.map((fb) => (
                <tr key={fb.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {fb.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{fb.centre_id}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fb.reviewed_by}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`status-badge ${fb.decision === 'CONFIRMED' ? 'critical' : 'normal'}`}>
                      {fb.decision}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {fb.category.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: 'var(--accent-cyan)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {fb.model_recalibration_flag}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(fb.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
