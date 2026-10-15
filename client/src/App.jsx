import React, { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import PricingCheckout from './components/PricingCheckout'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import OrdersLedger from './components/OrdersLedger'
import ArchitectureVisualizer from './components/ArchitectureVisualizer'
import ApiExplorer from './components/ApiExplorer'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'

const DEFAULT_PRODUCTS = [
  {
    id: 'starter',
    name: 'Developer Starter',
    description: 'Lightweight single-instance infrastructure for microservices, prototypes, and testing.',
    monthlyPrice: 29,
    annualPrice: 290,
    features: ['Single-tenant instance', 'SQLite / Postgres support', 'Up to 10k requests/mo', 'Community Support'],
    isPopular: false,
    badge: 'Fast Track'
  },
  {
    id: 'pro',
    name: 'Cloud Scale Pro',
    description: 'High-throughput enterprise pipeline with automated CI/CD and managed cloud database.',
    monthlyPrice: 99,
    annualPrice: 990,
    features: ['High-throughput Kestrel API', 'Azure SQL / Neon Postgres', 'Automated CI/CD Pipeline', 'Stripe Webhooks & Idempotency'],
    isPopular: true,
    badge: 'Most Popular'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Agentic',
    description: 'Full 4-layer Clean Architecture with distributed tracing, zero-downtime scaling, and 24/7 SLA.',
    monthlyPrice: 299,
    annualPrice: 2990,
    features: ['Clean Architecture 4-Layer', 'Azure Container Apps / ECS', 'Full Observability & Metrics', '24/7 Dedicated Support'],
    isPopular: false,
    badge: 'Enterprise'
  }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('checkout')
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/health')
      if (res.ok) {
        const json = await res.json()
        setHealth(json)
      } else {
        setHealth({ status: 'Degraded' })
      }
    } catch {
      setHealth({ status: 'Offline' })
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          setProducts(json)
        }
      }
    } catch {
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const json = await res.json()
        setOrders(json)
      }
    } catch {
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    const savedUser = localStorage.getItem('nexuscore_user')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('nexuscore_user')
      }
    }

    fetchHealth()
    fetchProducts()
    fetchOrders()

    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('order_id')
    if (orderId) {
      addToast('success', 'Checkout Successful', `Completed session verification for: ${orderId.substring(0, 16)}...`)
    }
  }, [fetchHealth, fetchProducts, fetchOrders, addToast])

  const handleAuthSuccess = (data) => {
    setCurrentUser(data)
    localStorage.setItem('nexuscore_user', JSON.stringify(data))
    addToast('success', 'Authenticated', `Welcome back, ${data.fullName}`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('nexuscore_user')
    addToast('info', 'Signed Out', 'Your session has been terminated.')
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'checkout' && (
          <PricingCheckout
            products={products}
            onOrderCreated={fetchOrders}
            addToast={addToast}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard addToast={addToast} />
        )}

        {activeTab === 'orders' && (
          <OrdersLedger
            orders={orders}
            loading={ordersLoading}
            onRefresh={fetchOrders}
            addToast={addToast}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureVisualizer />
        )}

        {activeTab === 'explorer' && (
          <ApiExplorer currentUser={currentUser} addToast={addToast} />
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#080B11] py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-6 text-slate-400 font-mono text-[11px]">
          <span>ASP.NET Core Kestrel</span>
          <span>•</span>
          <span>Entity Framework Core</span>
          <span>•</span>
          <span>Stripe.net Payments</span>
          <span>•</span>
          <span>Azure Container Ready</span>
        </div>
        <p className="text-slate-600">
          NexusCore SaaS Enterprise Platform • Clean Architecture Showcase
        </p>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
