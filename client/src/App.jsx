import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PricingCheckout from './components/PricingCheckout';
import OrdersLedger from './components/OrdersLedger';
import ArchitectureVisualizer from './components/ArchitectureVisualizer';
import ApiExplorer from './components/ApiExplorer';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  const loadPlatformState = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, sumRes, ordRes, healthRes] = await Promise.allSettled([
        fetch('/api/products'),
        fetch('/api/analytics/summary'),
        fetch('/api/orders'),
        fetch('/health')
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
        setProducts(await prodRes.value.json());
      }
      if (sumRes.status === 'fulfilled' && sumRes.value.ok) {
        setSummary(await sumRes.value.json());
      }
      if (ordRes.status === 'fulfilled' && ordRes.value.ok) {
        setOrders(await ordRes.value.json());
      }
      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        setHealth(await healthRes.value.json());
      }
    } catch {
      showToast('Running with local resilient telemetry snapshot', 'info');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPlatformState();
  }, [loadPlatformState]);

  const handleInitiateCheckout = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      const res = await fetch(`/api/payments/checkout/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: window.location.origin,
          cancelUrl: window.location.origin
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Could not initiate checkout session');
      }
      showToast(
        `Stripe Session ${data.sessionId || 'Created'} (${data.isSimulated ? 'Simulated Mode' : 'Live Mode'})`,
        'info'
      );
      await loadPlatformState();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleSimulateSuccess = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      const res = await fetch(`/api/payments/simulate-success/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Order transition rejected by domain invariant');
      }
      showToast(`Order #${orderId} transitioned to Paid & Domain Event dispatched`, 'success');
      await loadPlatformState();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] bg-grid-pattern relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          health={health}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            setUser(null);
            showToast('JWT session cleared', 'info');
          }}
        />

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <AnalyticsDashboard
              summary={summary}
              onRefresh={loadPlatformState}
              isLoading={isLoading}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'pricing') && (
            <PricingCheckout
              products={products}
              orders={orders}
              onInitiateCheckout={handleInitiateCheckout}
              onSimulateSuccess={handleSimulateSuccess}
              busyOrderId={busyOrderId}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'orders') && (
            <OrdersLedger
              orders={orders}
              onInitiateCheckout={handleInitiateCheckout}
              onSimulateSuccess={handleSimulateSuccess}
              busyOrderId={busyOrderId}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'architecture') && (
            <ArchitectureVisualizer />
          )}

          {(activeTab === 'overview' || activeTab === 'explorer') && (
            <ApiExplorer token={user?.token} />
          )}
        </main>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={setUser}
        showToast={showToast}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
