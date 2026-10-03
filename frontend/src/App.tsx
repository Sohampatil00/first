import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AlertReviewModal } from './components/AlertReviewModal';
import { OverviewScreen } from './screens/OverviewScreen';
import { CentresScreen } from './screens/CentresScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { LiveCamerasScreen } from './screens/LiveCamerasScreen';
import { AuditScreen } from './screens/AuditScreen';
import { AnalyticsOverview, Centre, ComplianceEvent } from './types';
import { fetchAnalyticsOverview, fetchCentres, fetchAlerts, reviewAlert } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [alerts, setAlerts] = useState<ComplianceEvent[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ComplianceEvent | null>(null);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [analyticsData, centresData, alertsData] = await Promise.all([
        fetchAnalyticsOverview(),
        fetchCentres(),
        fetchAlerts()
      ]);
      setAnalytics(analyticsData);
      setCentres(centresData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket Live Sync Listener
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ALERT') {
              setToastMessage(`New Discrepancy Alert: ${data.event_type} (${data.severity}) at ${data.centre_id}`);
              loadData();
            } else if (data.type === 'ALERT_STATUS_UPDATED') {
              loadData();
            }
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws?.close();
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [loadData]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleReviewSubmit = async (
    alertId: string, 
    status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW', 
    notes: string
  ) => {
    await reviewAlert(alertId, {
      status,
      review_notes: notes,
      reviewed_by: 'OFFICER_PATIL'
    });
    setToastMessage(`Case ${alertId.slice(0, 8)} updated to ${status}. Recorded in audit trail.`);
    await loadData();
  };

  const handleSelectCentre = (centreId: string) => {
    setSelectedCentreId(centreId);
    setCurrentTab('centres');
  };

  const openAlertsCount = alerts.filter(a => a.status === 'NEW').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        openAlertsCount={openAlertsCount} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header 
          wsConnected={wsConnected} 
          onRefresh={loadData} 
          openAlertsCount={openAlertsCount} 
        />

        <main style={{ padding: '28px', flex: 1 }}>
          {currentTab === 'overview' && (
            <OverviewScreen 
              analytics={analytics}
              centres={centres}
              alerts={alerts}
              onSelectAlert={setSelectedAlert}
              onSelectCentre={handleSelectCentre}
            />
          )}

          {currentTab === 'centres' && (
            <CentresScreen initialCentreId={selectedCentreId} />
          )}

          {currentTab === 'alerts' && (
            <AlertsScreen 
              alerts={alerts}
              onSelectAlert={setSelectedAlert}
            />
          )}

          {currentTab === 'cameras' && (
            <LiveCamerasScreen />
          )}

          {currentTab === 'audit' && (
            <AuditScreen />
          )}
        </main>
      </div>

      {/* Evidence Review Modal */}
      <AlertReviewModal 
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onReviewSubmit={handleReviewSubmit}
      />

      {/* Floating Live Telemetry Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '8px',
          padding: '12px 18px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 200,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <span className="pulse-dot online"></span>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
