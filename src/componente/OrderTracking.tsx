import { useState, useEffect, useRef } from 'react';
import {
  Coffee, CheckCircle2, Truck, Home,
  Star, Package, Clock, MapPin, ArrowLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Types ─── */
export interface TrackingItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderTrackingProps {
  orderNumber: string;
  total: number;
  paymentMethod: 'card' | 'pix';
  installments: string;
  items: TrackingItem[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onGoBack: () => void;
  onFinish: () => void;
}

/* ─── Steps ─── */
const STEPS = [
  {
    id: 'accepted',
    label: 'Pedido aceito',
    detail: 'Recebemos e confirmamos seu pedido',
    Icon: CheckCircle2,
    activateAt: 0,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    detail: 'Nosso barista está trabalhando com carinho',
    Icon: Coffee,
    activateAt: 4000,
  },
  {
    id: 'shipping',
    label: 'A caminho',
    detail: 'Seu pedido saiu para entrega!',
    Icon: Truck,
    activateAt: 11000,
  },
] as const;

/* ─── Countdown ─── */
function Countdown({ active }: { active: boolean }) {
  const [secs, setSecs] = useState(28 * 60 + 43);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active]);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return (
    <span className="font-black text-5xl text-gray-800 font-mono tracking-tight tabular-nums">
      {m}<span className="text-orange-400 animate-pulse">:</span>{s}
    </span>
  );
}

/* ─── Route map ─── */
function RouteMap({ step }: { step: number }) {
  const progress = step === 0 ? 4 : step === 1 ? 38 : 90;
  return (
    <div className="relative rounded-2xl overflow-hidden bg-amber-50 border border-orange-100 h-40 w-full">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
        <defs>
          <pattern id="mapgrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#92400e" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
        <path d="M 55,120 C 110,120 150,45 240,45 S 360,80 420,58 S 468,46 480,72"
          fill="none" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        <path d="M 55,120 C 110,120 150,45 240,45 S 360,80 420,58 S 468,46 480,72"
          fill="none" stroke="url(#rg)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray="430"
          strokeDashoffset={430 - (progress / 100) * 430}
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>

      {/* Store */}
      <div className="absolute left-[9%] bottom-[16%] flex flex-col items-center gap-0.5">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-md shadow-orange-200">
          <Coffee className="h-4 w-4 text-white" />
        </div>
        <span className="text-[9px] text-orange-600 font-bold">Loja</span>
      </div>

      {/* Moving delivery */}
      <div
        className="absolute top-[22%] -translate-y-1/2 transition-all duration-[1800ms] ease-in-out"
        style={{ left: `calc(${9 + progress * 0.8}% - 16px)` }}
      >
        <div className={`p-2 rounded-full shadow-lg transition-all duration-700 ${step >= 1 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-300 scale-110' : 'bg-orange-200'}`}>
          <Truck className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Home */}
      <div className="absolute right-[6%] top-[38%] flex flex-col items-center gap-0.5">
        <div className={`p-2 rounded-xl shadow-md transition-all duration-700 ${step >= 2 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200 scale-110' : 'bg-orange-100'}`}>
          <Home className={`h-4 w-4 ${step >= 2 ? 'text-white' : 'text-orange-400'}`} />
        </div>
        <span className="text-[9px] text-orange-600 font-bold">Você</span>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="text-[9px] text-orange-400/60 font-medium tracking-wider uppercase">Rota de entrega</span>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function OrderTracking({
  orderNumber, total, paymentMethod, installments, items,
  initialStep = 0, onStepChange, onGoBack, onFinish,
}: OrderTrackingProps) {
  const [step, setStep] = useState(initialStep);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => {
        const next = i + 1;
        setStep(next);
        onStepChange?.(next);
      }, s.activateAt)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const active = STEPS[step];

  return (
    <>
      <style>{`
        @keyframes icon-pop { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes ring-p   { 0%{transform:scale(1);opacity:.45} 100%{transform:scale(1.8);opacity:0} }
        @keyframes scw      { to{transform:rotate(360deg)} }
        @keyframes sccw     { to{transform:rotate(-360deg)} }
        @keyframes fadeup   { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
        .icon-pop  { animation: icon-pop .45s cubic-bezier(.175,.885,.32,1.275) forwards }
        .ring-a    { animation: ring-p 2s ease-out infinite }
        .ring-b    { animation: ring-p 2s ease-out .65s infinite }
        .scw       { animation: scw  14s linear infinite }
        .sccw      { animation: sccw 10s linear infinite }
        .fadeup    { animation: fadeup .45s ease forwards }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-orange-100 shadow-sm">
          <div className="w-full px-6 py-3.5 flex items-center justify-between">
            <Button variant="ghost" onClick={onGoBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 -ml-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Início
            </Button>

            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 rounded-xl">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">CaféHub</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pedido</p>
              <p className="text-sm font-black text-orange-600 font-mono">{orderNumber}</p>
            </div>
          </div>
        </header>

        {/* ── Hero banner (full width) ── */}
        <div className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute top-4 left-1/3 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative w-full px-6 py-10 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Orb */}
            <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 130, height: 130 }}>
              <div className="ring-a absolute w-24 h-24 rounded-full border-2 border-white/40" />
              <div className="ring-b absolute w-24 h-24 rounded-full border-2 border-white/25" />
              <svg className="scw absolute" width="122" height="122" viewBox="0 0 122 122">
                <circle cx="61" cy="61" r="57" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="10 7" opacity="0.25" />
              </svg>
              <svg className="sccw absolute" width="98" height="98" viewBox="0 0 98 98">
                <circle cx="49" cy="49" r="45" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 9" opacity="0.15" />
              </svg>
              <div key={step} className="icon-pop w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 shadow-2xl">
                <active.Icon className="h-10 w-10 text-white drop-shadow-md" strokeWidth={1.5} />
              </div>
            </div>

            {/* Status text */}
            <div className="text-center sm:text-left" key={`txt-${step}`}>
              <p className="fadeup text-3xl font-black text-white tracking-tight">{active.label}</p>
              <p className="fadeup text-white/70 mt-1 text-base" style={{ animationDelay: '80ms' }}>{active.detail}</p>

              {/* Step dots */}
              <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
                {STEPS.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-500 ${
                    i === step ? 'w-7 h-2.5 bg-white' : i < step ? 'w-2.5 h-2.5 bg-white/60' : 'w-2.5 h-2.5 bg-white/25'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div
          className={`w-full px-4 sm:px-6 lg:px-10 py-6 grid lg:grid-cols-[1fr_420px] gap-6 items-start max-w-screen-xl mx-auto transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >

          {/* ── LEFT ── */}
          <div className="space-y-5">

            {/* Progress steps */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-5">Acompanhe seu pedido</h2>
              <div className="space-y-0">
                {STEPS.map((s, i) => {
                  const done    = i < step;
                  const current = i === step;
                  const isLast  = i === STEPS.length - 1;
                  return (
                    <div key={s.id} className="flex gap-5">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                          done    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200'
                          : current ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200 scale-110'
                          : 'bg-gray-100'
                        }`}>
                          {done
                            ? <CheckCircle2 className="h-5 w-5 text-white" />
                            : <s.Icon className={`h-5 w-5 ${current ? 'text-white' : 'text-gray-400'}`} />
                          }
                        </div>
                        {!isLast && (
                          <div className="w-0.5 my-1.5 flex-1 min-h-[36px] rounded-full overflow-hidden bg-gray-100">
                            <div className="w-full bg-gradient-to-b from-orange-400 to-red-400 transition-all duration-[1400ms] ease-in-out"
                              style={{ height: done ? '100%' : '0%' }} />
                          </div>
                        )}
                      </div>
                      {/* Text */}
                      <div className={`pt-2 flex-1 ${!isLast ? 'pb-6' : ''}`}>
                        <p className={`font-bold text-sm transition-colors duration-500 ${current || done ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</p>
                        <p className={`text-xs mt-0.5 transition-colors duration-500 ${current ? 'text-orange-500 font-semibold' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                          {current ? s.detail : done ? 'Concluído ✓' : 'Aguardando…'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-400" />
                  <span className="font-bold text-gray-700 text-sm">
                    {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <span className="text-sm font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <div className="divide-y divide-orange-50">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="relative flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover border border-orange-100" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    <p className="font-bold text-gray-700 text-sm flex-shrink-0">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3.5 bg-orange-50/60 border-t border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}
                  <span className="text-xs text-gray-400 ml-1.5">4.9</span>
                </div>
                <p className="text-xs text-gray-400">
                  {paymentMethod === 'pix' ? 'Pago via PIX' : `Cartão · ${installments}× sem juros`}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-5 lg:sticky lg:top-20">

            {/* ETA card */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Previsão de entrega</p>
                  </div>
                  <Countdown active={step >= 2} />
                  <p className="text-xs text-gray-400 mt-1">minutos restantes</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-bold text-orange-600">Ao vivo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-gray-300" />
                    Rastreando entrega
                  </div>
                </div>
              </div>
              <RouteMap step={step} />
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={onGoBack}
                variant="outline"
                className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl py-5 font-bold text-sm"
              >
                Ir ao início
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                onClick={onFinish}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 hover:scale-[1.01] transition-all duration-200 rounded-2xl py-5 font-bold text-sm shadow-lg shadow-orange-200"
              >
                Pedido recebido ✓
              </Button>
              <p className="text-center text-xs text-gray-400">
                Clique ao receber seu pedido para finalizar
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
