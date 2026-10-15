import React, { useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Zap,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Terminal
} from 'lucide-react'

export default function PricingCheckout({
  products,
  onOrderCreated,
  addToast,
  currentUser
}) {
  const [billingInterval, setBillingInterval] = useState('monthly')
  const [selectedProduct, setSelectedProduct] = useState(products[1] || products[0])
  const [email, setEmail] = useState(currentUser?.email || '')
  const [loading, setLoading] = useState(false)
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null)
  const [simulating, setSimulating] = useState(false)

  const activePrice = (product) => {
    if (!product) return 0
    return billingInterval === 'monthly' ? product.monthlyPrice : product.annualPrice
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!email) {
      addToast('error', 'Validation Error', 'Please specify an email address for checkout.')
      return
    }

    setLoading(true)

    try {
      const orderPayload = {
        customerEmail: email,
        productName: `${selectedProduct.name} (${billingInterval})`,
        totalAmount: activePrice(selectedProduct),
        currency: 'usd'
      }

      const createOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (!createOrderRes.ok) {
        const errorJson = await createOrderRes.json()
        throw new Error(errorJson.title || 'Could not create order entity')
      }

      const orderData = await createOrderRes.json()
      setLastCreatedOrder(orderData)
      onOrderCreated()

      const checkoutRes = await fetch(`/api/payments/checkout/${orderData.id}`, {
        method: 'POST'
      })

      if (!checkoutRes.ok) {
        throw new Error('Failed to create Stripe Checkout session')
      }

      const checkoutData = await checkoutRes.json()

      addToast('success', 'Order Initialized', `Order ${orderData.id.substring(0, 8)}... created in EF Core`)

      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      }
    } catch (err) {
      addToast('error', 'Checkout Exception', err.message || 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateWebhook = async (orderId) => {
    setSimulating(true)
    try {
      const res = await fetch(`/api/payments/simulate-success/${orderId}`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        addToast('success', 'State Transitioned', `Order marked as PAID via simulated webhook event!`)
        onOrderCreated()
        setLastCreatedOrder(prev => prev ? { ...prev, status: 'Paid' } : null)
      } else {
        throw new Error(data.message || 'Simulation failed')
      }
    } catch (err) {
      addToast('error', 'Simulation Error', err.message)
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Zap className="h-3.5 w-3.5" />
          <span>Production-Ready ASP.NET Core & Stripe Infrastructure</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight">
          Cloud-Native Enterprise Subscriptions
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Built according to Twelve-Factor SaaS principles: compiled C# type safety, Entity Framework Core query tracking, and cryptographically verified Stripe checkout pipelines.
        </p>

        <div className="pt-2 flex items-center justify-center space-x-3">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl inline-flex items-center">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id
          const price = activePrice(product)

          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-200 border relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/70 shadow-2xl shadow-indigo-950/60 scale-[1.02]'
                  : 'bg-[#0E131F]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#121827]/60'
              }`}
            >
              {product.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30">
                  Recommended Tier
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                    {product.badge || 'Standard Tier'}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-baseline space-x-1 pt-2 border-t border-slate-800/80">
                  <span className="text-3xl font-extrabold text-white">${price}</span>
                  <span className="text-xs text-slate-400">/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                  {product.features?.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Plan' : 'Choose Plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Checkout Dispatcher</h3>
                <p className="text-xs text-slate-400">Initiates ASP.NET Core `/api/orders` & Stripe Checkout Session</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Live Mock & Stripe Mode
            </span>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Customer Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@enterprise.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Plan:</span>
                <span className="text-white font-medium">{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Billing Interval:</span>
                <span className="capitalize text-white font-medium">{billingInterval}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span className="font-semibold text-white">Total Immediate Amount:</span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  ${activePrice(selectedProduct)}.00 USD
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Entity Creation in EF Core...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Stripe Checkout Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Terminal className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold">Instant Webhook Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test the complete end-to-end webhook event handling loop instantly without running a Stripe CLI tunnel or using a test credit card.
          </p>

          {lastCreatedOrder ? (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pending Order:</span>
                <span className="font-mono text-[10px] text-indigo-300">{lastCreatedOrder.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  lastCreatedOrder.status === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {lastCreatedOrder.status}
                </span>
              </div>

              {lastCreatedOrder.status !== 'Paid' ? (
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulateWebhook(lastCreatedOrder.id)}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {simulating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Simulate Stripe Webhook Succeeded Event</span>
                </button>
              ) : (
                <div className="text-center py-1 text-xs text-emerald-400 font-medium">
                  Order successfully confirmed as Paid in database!
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
              <ShieldAlert className="h-6 w-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No recent order created in this session.</p>
              <p className="text-[11px] text-slate-500">
                Click "Proceed to Stripe Checkout" above to generate a live order, and this panel will enable the 1-click webhook simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
