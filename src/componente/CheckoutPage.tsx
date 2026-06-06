import { useState, useRef, useEffect } from 'react';
import {
  Coffee, ArrowLeft, ShieldCheck, Star, CreditCard,
  QrCode, CheckCircle2, Copy, Lock, Truck, Tag,
  Wifi, User, Calendar, Eye, EyeOff, Sparkles,
  Clock, ChevronDown, MapPin, Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/* ─────────────────── Types ─────────────────── */
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  origin: string;
}

export interface OrderDetails {
  orderNumber: string;
  total: number;
  paymentMethod: 'card' | 'pix';
  installments: string;
}

interface CheckoutPageProps {
  cart: CartItem[];
  onBack: () => void;
  onConfirm: (details: OrderDetails) => void;
}

/* ─────────────────── Helpers ─────────────────── */
const FRETE_GRATIS_THRESHOLD = 80;
const FRETE_VALOR = 8.9;

function fmtCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function fmtCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}
function fmtCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})/, '$1-$2');
}
function fmtPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})/, '$1-$2');
}

const BR_STATES: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

interface ViaCEPResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface NominatimResponse {
  address: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

function cardNetwork(num: string): 'visa' | 'mastercard' | 'generic' {
  const n = num.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  return 'generic';
}

function maskCardNumber(num: string) {
  const raw = num.replace(/\s/g, '').padEnd(16, '•');
  return [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12), raw.slice(12, 16)]
    .map((g, i) => (i < 2 ? g.replace(/\d/g, '•') : g))
    .join('  ');
}

/* ─────────────────── Sub-components ─────────────────── */

/* Visa SVG wordmark */
function VisaLogo() {
  return (
    <svg viewBox="0 0 780 500" className="h-7 w-auto" fill="white">
      <path d="M293 348.9l33.4-195.7h53.4l-33.4 195.7H293zM541.2 157.9c-10.6-3.9-27.1-8.1-47.8-8.1-52.7 0-89.9 26.3-90.2 64-0.3 27.9 26.6 43.4 46.9 52.7 20.8 9.5 27.8 15.6 27.7 24.1-0.1 13-16.6 19-31.9 19-21.4 0-32.7-2.9-50.2-10.1l-6.9-3.1-7.5 43.4c12.4 5.4 35.4 10.1 59.3 10.3 55.9 0 92.2-25.9 92.7-66 0.2-22-14.1-38.7-44.9-52.5-18.7-8.9-30.2-14.9-30.1-23.9 0-8 9.7-16.6 30.8-16.6 17.5-0.3 30.2 3.5 40 7.4l4.8 2.2 7.3-42.8M676.7 153.2h-41.2c-12.8 0-22.3 3.4-27.9 16l-79.2 176.7h56l11.1-28.7 68.3 0.1 6.4 28.6H722L676.7 153.2zM611.6 278.4c4.4-11.2 21.2-54 21.2-54-0.3 0.5 4.4-11.2 7.1-18.5l3.6 16.7s10.2 46.2 12.3 55.8H611.6zM240.5 153.2l-52.2 133.7-5.6-26.9c-9.7-30.9-40-64.4-73.9-81.1l47.8 169.8 56.5-0.1 84.1-195.4h-56.7" />
    </svg>
  );
}

/* Mastercard SVG */
function MastercardLogo() {
  return (
    <svg viewBox="0 0 152.4 108" className="h-7 w-auto">
      <circle cx="54" cy="54" r="54" fill="#EB001B" />
      <circle cx="98.4" cy="54" r="54" fill="#F79E1B" />
      <path d="M76.2 21.7a54 54 0 0 1 0 64.6 54 54 0 0 1 0-64.6z" fill="#FF5F00" />
    </svg>
  );
}

/* 3D Credit Card Preview */
function CardPreview({
  number, name, expiry, cvv, flipped,
}: {
  number: string; name: string; expiry: string; cvv: string; flipped: boolean;
}) {
  const network = cardNetwork(number);

  return (
    <div className="w-full flex justify-center mb-2" style={{ perspective: '1000px' }}>
      <div
        className="relative w-80 h-48 transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          {/* Orange/red glow matching brand */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl" />

          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <Coffee className="h-6 w-6 text-orange-400" />
                <span className="text-white/60 text-xs font-medium tracking-widest uppercase">CaféHub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-5 w-5 text-white/50 rotate-90" />
              </div>
            </div>

            {/* Chip + number */}
            <div className="space-y-4">
              {/* EMV chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-0.5 p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1 bg-yellow-700/50 rounded-[1px]" />
                  ))}
                </div>
              </div>

              <p className="text-white font-mono text-lg tracking-[0.2em] font-bold">
                {maskCardNumber(number)}
              </p>
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Titular</p>
                <p className="text-white font-medium text-sm tracking-wider truncate max-w-[140px]">
                  {name || 'SEU NOME AQUI'}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Validade</p>
                <p className="text-white font-mono font-medium text-sm">
                  {expiry || 'MM/AA'}
                </p>
              </div>
              <div className="ml-3">
                {network === 'visa' && <VisaLogo />}
                {network === 'mastercard' && <MastercardLogo />}
                {network === 'generic' && (
                  <CreditCard className="h-8 w-8 text-white/40" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl" />

          <div className="relative h-full flex flex-col justify-between py-5">
            {/* Magnetic stripe */}
            <div className="w-full h-12 bg-gray-950" />

            <div className="px-6 space-y-3">
              {/* Signature strip */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-9 bg-white/90 rounded flex items-center">
                  <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 rounded"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}
                  />
                </div>
                <div className="bg-white rounded px-3 py-2 min-w-[56px] text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">CVV</p>
                  <p className="font-mono font-bold text-gray-800 text-sm">{cvv || '•••'}</p>
                </div>
              </div>
              <p className="text-white/30 text-xs text-center">
                Este cartão é de propriedade do emissor
              </p>
            </div>

            <div className="px-6 flex justify-end">
              {network === 'visa' && <VisaLogo />}
              {network === 'mastercard' && <MastercardLogo />}
              {network === 'generic' && <CreditCard className="h-8 w-8 text-white/30" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pixel QR code – better pattern */
const QR_PATTERN = [
  1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1,
  1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,1,
  1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1,
  1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1,
  1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1,
  1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,
  1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,
  0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,
  1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,
  0,1,0,0,1,1,0,1,0,1,0,0,1,0,0,1,1,0,1,0,0,
  1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,
  0,0,1,1,0,0,0,0,0,1,1,0,1,0,0,0,1,1,0,0,1,
  1,0,1,0,1,1,1,1,1,0,1,1,0,0,1,0,0,1,1,0,1,
  0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,
  1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,
  1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,1,0,
  1,0,1,1,1,0,1,0,1,1,0,1,1,0,0,0,1,0,0,1,1,
  1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,
  1,0,1,1,1,0,1,0,1,0,1,0,0,1,1,0,1,1,0,1,0,
  1,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,0,0,1,0,1,
  1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,
];

function PixQRCode() {
  return (
    <div
      className="grid bg-white p-3 rounded-2xl shadow-inner"
      style={{ gridTemplateColumns: 'repeat(21, 1fr)', gap: '1.5px', width: 192, height: 192 }}
    >
      {QR_PATTERN.map((cell, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{ backgroundColor: cell ? '#111827' : 'white' }}
        />
      ))}
    </div>
  );
}

/* Countdown timer for PIX */
function PixTimer() {
  const [seconds, setSeconds] = useState(600);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  const pct = (seconds / 600) * 100;
  const urgent = seconds < 120;

  return (
    <div className={`flex flex-col items-center gap-2 px-5 py-3 rounded-2xl border ${urgent ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${urgent ? 'text-red-500' : 'text-orange-500'}`} />
        <span className={`text-sm font-medium ${urgent ? 'text-red-600' : 'text-orange-700'}`}>
          QR Code válido por
        </span>
      </div>
      <p className={`text-2xl font-mono font-bold ${urgent ? 'text-red-600' : 'text-orange-700'}`}>
        {m}:{s}
      </p>
      <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-orange-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* Floating label field */
function Field({
  id, label, placeholder, value, onChange,
  type = 'text', maxLength, icon: Icon, className = '', inputClass = '',
}: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; maxLength?: number;
  icon?: React.ElementType; className?: string; inputClass?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={active ? placeholder : ''}
        className={`peer w-full border rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800 outline-none transition-all duration-200 bg-white
          ${focused ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-orange-200'}
          ${Icon ? 'pr-10' : ''} ${inputClass}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none select-none
          ${active ? 'top-1.5 text-[10px] font-semibold tracking-wide' : 'top-1/2 -translate-y-1/2 text-sm'}
          ${focused ? 'text-orange-500' : 'text-gray-400'}`}
      >
        {label}
      </label>
      {Icon && (
        <Icon className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${focused ? 'text-orange-400' : 'text-gray-300'}`} />
      )}
    </div>
  );
}

/* ─────────────────── Main Component ─────────────────── */
export function CheckoutPage({ cart, onBack, onConfirm }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [installments, setInstallments] = useState('1');
  const [cvvFocused, setCvvFocused] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoSource, setGeoSource] = useState<'gps' | 'ip' | null>(null);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', cpf: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    cardNumber: '', cardName: '', cardExpiry: '', cardCVV: '',
    coupon: '',
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm(p => ({ ...p, [field]: value }));

  const fillAddress = (data: { street?: string; neighborhood?: string; city?: string; state?: string; cep?: string }) => {
    setForm(p => ({
      ...p,
      ...(data.street !== undefined && { street: data.street }),
      ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.cep !== undefined && { cep: data.cep }),
    }));
  };

  const fetchViaCEP = async (raw: string) => {
    if (raw.length !== 8) return;
    setCepStatus('loading');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data: ViaCEPResponse = await res.json();
      if (data.erro) {
        setCepStatus('error');
        return;
      }
      fillAddress({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      });
      setCepStatus('success');
      // Auto-focus number field after filling
      setTimeout(() => document.getElementById('number')?.focus(), 100);
    } catch {
      setCepStatus('error');
    }
  };

  const handleCEPChange = (raw: string) => {
    const formatted = fmtCEP(raw);
    set('cep', formatted);
    setCepStatus('idle');
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) fetchViaCEP(digits);
  };

  // Preenche a partir de coordenadas via Nominatim
  const fillFromCoords = async (lat: number, lon: number): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`
      );
      if (!res.ok) return false;
      const data: NominatimResponse = await res.json();
      const addr = data.address;
      const rawCep = (addr.postcode ?? '').replace(/\D/g, '');
      fillAddress({
        street: addr.road ?? addr.pedestrian ?? '',
        neighborhood: addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? '',
        city: addr.city ?? addr.town ?? addr.village ?? '',
        state: BR_STATES[addr.state ?? ''] ?? addr.state?.slice(0, 2).toUpperCase() ?? '',
        cep: rawCep ? fmtCEP(rawCep) : '',
      });
      if (rawCep.length === 8) {
        await fetchViaCEP(rawCep); // enriquece com logradouro exato
      }
      return true;
    } catch {
      return false;
    }
  };

  // Normaliza resultado de qualquer serviço de IP geo
  interface IPGeoResult { lat: number; lon: number; city: string; uf: string; postal: string; }

  const ipGeoServices: Array<() => Promise<IPGeoResult>> = [
    // 1. ipapi.co
    async () => {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json() as { latitude?: number; longitude?: number; city?: string; region_code?: string; postal?: string; error?: boolean };
      if (d.error || !d.latitude) throw new Error('ipapi.co error');
      return { lat: d.latitude!, lon: d.longitude!, city: d.city ?? '', uf: d.region_code ?? '', postal: d.postal ?? '' };
    },
    // 2. freeipapi.com
    async () => {
      const r = await fetch('https://freeipapi.com/api/json');
      const d = await r.json() as { latitude?: number; longitude?: number; cityName?: string; regionName?: string; zipCode?: string };
      if (!d.latitude) throw new Error('freeipapi error');
      return { lat: d.latitude!, lon: d.longitude!, city: d.cityName ?? '', uf: BR_STATES[d.regionName ?? ''] ?? '', postal: d.zipCode ?? '' };
    },
    // 3. geojs.io (só coordenadas, sem CEP)
    async () => {
      const r = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const d = await r.json() as { latitude?: string; longitude?: string; city?: string; region?: string };
      if (!d.latitude) throw new Error('geojs error');
      return { lat: Number(d.latitude), lon: Number(d.longitude), city: d.city ?? '', uf: BR_STATES[d.region ?? ''] ?? '', postal: '' };
    },
  ];

  // IP geo preenche APENAS cidade e UF — CEP por IP é impreciso
  const fillFromIP = async (): Promise<boolean> => {
    for (const svc of ipGeoServices) {
      try {
        const geo = await svc();
        if (!geo.city && !geo.uf) continue;
        fillAddress({ city: geo.city, state: geo.uf });
        return true;
      } catch {
        // tenta próximo serviço
      }
    }
    return false;
  };

  const handleGeolocation = async () => {
    setGeoLoading(true);
    setGeoError('');
    setGeoSource(null);

    // 1. Tenta GPS do navegador (preciso — preenche tudo)
    if (navigator.geolocation) {
      const gpsResult = await new Promise<GeolocationPosition | null>(resolve => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve(pos),
          () => resolve(null),
          { timeout: 6000, enableHighAccuracy: false, maximumAge: 60000 }
        );
      });

      if (gpsResult) {
        const ok = await fillFromCoords(gpsResult.coords.latitude, gpsResult.coords.longitude);
        setGeoLoading(false);
        if (ok) {
          setGeoSource('gps');
        } else {
          setGeoError('GPS obtido, mas endereço não encontrado. Digite o CEP.');
        }
        return;
      }
    }

    // 2. Fallback: IP geo — preenche apenas cidade e UF
    const ok = await fillFromIP();
    setGeoLoading(false);
    if (ok) {
      setGeoSource('ip');
    } else {
      setGeoError('Não foi possível detectar a localização. Digite o CEP para preenchimento automático.');
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const frete = subtotal >= FRETE_GRATIS_THRESHOLD ? 0 : FRETE_VALOR;
  const total = subtotal + frete;
  const orderNumber = `CLX-${Date.now().toString().slice(-6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText('cafehub@pagamentos.pix').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 -ml-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <button
            onClick={onBack}
            className="flex items-center gap-2.5 group"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Coffee className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              CaféHub
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            <span className="font-medium text-green-700">Ambiente seguro</span>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto px-6 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { label: 'Carrinho', done: true },
              { label: 'Pagamento', done: false, active: true },
              { label: 'Confirmação', done: false },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1.5 font-semibold ${step.active ? 'text-orange-600' : step.done ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step.active ? 'bg-orange-500 text-white' : step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {step.done ? '✓' : i + 1}
                  </span>
                  {step.label}
                </div>
                {i < 2 && (
                  <div className={`h-px w-6 ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ── Left ── */}
        <div className="space-y-5">

          {/* 1. Personal + Delivery */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="bg-white border border-orange-200 p-2 rounded-xl shadow-sm">
                <Truck className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Dados & Entrega</h2>
                <p className="text-xs text-gray-400">Preencha para calcular o prazo</p>
              </div>
            </div>

            <div className="p-6 grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field id="fullName" label="Nome completo" placeholder="João da Silva"
                  value={form.fullName} onChange={v => set('fullName', v)} icon={User} />
                <Field id="cpf" label="CPF" placeholder="000.000.000-00"
                  value={form.cpf} onChange={v => set('cpf', fmtCPF(v))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field id="email" label="E-mail" placeholder="joao@email.com" type="email"
                  value={form.email} onChange={v => set('email', v)} />
                <Field id="phone" label="Telefone" placeholder="(11) 99999-9999"
                  value={form.phone} onChange={v => set('phone', fmtPhone(v))} />
              </div>

              {/* Divider + geolocation button */}
              <div className="flex items-center gap-3 my-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-100 to-transparent" />
                <span className="text-xs text-gray-400 font-medium">Endereço de entrega</span>
                <div className="h-px flex-1 bg-gradient-to-r from-orange-100 via-orange-100 to-transparent" />
              </div>

              {/* Geolocation button */}
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={geoLoading}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200
                  ${geoLoading
                    ? 'border-orange-200 text-orange-400 bg-orange-50 cursor-not-allowed'
                    : 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 active:scale-[0.99]'
                  }`}
              >
                {geoLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Obtendo localização…</>
                  : <><MapPin className="h-4 w-4" /> Usar minha localização atual</>
                }
              </button>
              {geoError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-px" />
                  {geoError}
                </div>
              )}
              {geoSource && (
                <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
                  <span>Digite o CEP abaixo que o endereço será preenchido automaticamente.</span>
                </div>
              )}

              {/* CEP + street row */}
              <div className="grid sm:grid-cols-3 gap-3">
                {/* CEP custom field with status */}
                <div className="relative">
                  <input
                    id="cep"
                    value={form.cep}
                    onChange={e => handleCEPChange(e.target.value)}
                    placeholder=""
                    maxLength={9}
                    className={`peer w-full border rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800 outline-none transition-all duration-200 bg-white pr-10
                      ${cepStatus === 'error' ? 'border-red-400 ring-2 ring-red-100'
                        : cepStatus === 'success' ? 'border-green-400 ring-2 ring-green-100'
                        : 'border-gray-200 hover:border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                      }`}
                  />
                  <label
                    htmlFor="cep"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none select-none
                      ${form.cep.length > 0 ? 'top-1.5 text-[10px] font-semibold tracking-wide' : 'top-1/2 -translate-y-1/2 text-sm'}
                      ${cepStatus === 'error' ? 'text-red-500'
                        : cepStatus === 'success' ? 'text-green-500'
                        : 'text-gray-400'
                      }`}
                  >
                    CEP
                  </label>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {cepStatus === 'loading' && <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />}
                    {cepStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {cepStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  {cepStatus === 'error' && (
                    <p className="absolute -bottom-5 left-0 text-[11px] text-red-500 font-medium">CEP não encontrado</p>
                  )}
                </div>
                <Field id="street" label="Rua / Avenida" placeholder="Preenchida automaticamente"
                  value={form.street} onChange={v => set('street', v)} className="sm:col-span-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field id="number" label="Número" placeholder="123"
                  value={form.number} onChange={v => set('number', v)} />
                <Field id="complement" label="Complemento" placeholder="Apto 42"
                  value={form.complement} onChange={v => set('complement', v)} className="sm:col-span-2" />
                <Field id="neighborhood" label="Bairro" placeholder="Centro"
                  value={form.neighborhood} onChange={v => set('neighborhood', v)} />
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                <Field id="city" label="Cidade" placeholder="São Paulo"
                  value={form.city} onChange={v => set('city', v)} className="sm:col-span-3" />
                <Field id="state" label="UF" placeholder="SP" maxLength={2}
                  value={form.state} onChange={v => set('state', v.toUpperCase())} />
              </div>
            </div>
          </section>

          {/* 2. Payment method */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="bg-white border border-orange-200 p-2 rounded-xl shadow-sm">
                <CreditCard className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Pagamento</h2>
                <p className="text-xs text-gray-400">Escolha seu método preferido</p>
              </div>
            </div>

            {/* Method selector */}
            <div className="px-6 pt-5">
              <RadioGroup
                value={paymentMethod}
                onValueChange={v => setPaymentMethod(v as 'card' | 'pix')}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  {
                    value: 'card', label: 'Cartão de Crédito',
                    icon: <CreditCard className="h-5 w-5" />,
                    sub: 'Até 6x sem juros',
                  },
                  {
                    value: 'pix', label: 'PIX',
                    icon: <QrCode className="h-5 w-5" />,
                    sub: 'Aprovação imediata',
                  },
                ].map(opt => (
                  <Label
                    key={opt.value}
                    htmlFor={`method-${opt.value}`}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                      paymentMethod === opt.value
                        ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm'
                        : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem id={`method-${opt.value}`} value={opt.value} className="sr-only" />
                    <div className={`p-2 rounded-xl ${paymentMethod === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === opt.value ? 'text-orange-700' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs ${paymentMethod === opt.value ? 'text-orange-500' : 'text-gray-400'}`}>
                        {opt.sub}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Card form */}
            {paymentMethod === 'card' && (
              <div className="px-6 pb-6 pt-5 space-y-5">
                {/* Live card preview */}
                <CardPreview
                  number={form.cardNumber}
                  name={form.cardName}
                  expiry={form.cardExpiry}
                  cvv={form.cardCVV}
                  flipped={cvvFocused}
                />

                <div className="space-y-3">
                  <Field
                    id="cardNumber"
                    label="Número do cartão"
                    placeholder="0000 0000 0000 0000"
                    value={form.cardNumber}
                    onChange={v => set('cardNumber', fmtCard(v))}
                    icon={CreditCard}
                  />
                  <Field
                    id="cardName"
                    label="Nome impresso no cartão"
                    placeholder="JOÃO DA SILVA"
                    value={form.cardName}
                    onChange={v => set('cardName', v.toUpperCase())}
                    icon={User}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="cardExpiry"
                      label="Validade"
                      placeholder="MM/AA"
                      value={form.cardExpiry}
                      onChange={v => set('cardExpiry', fmtExpiry(v))}
                      icon={Calendar}
                    />
                    <div className="relative">
                      <input
                        id="cardCVV"
                        type={showCvv ? 'text' : 'password'}
                        maxLength={4}
                        value={form.cardCVV}
                        onChange={e => set('cardCVV', e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setCvvFocused(true)}
                        onBlur={() => setCvvFocused(false)}
                        placeholder={cvvFocused ? '•••' : ''}
                        className={`peer w-full border rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800 outline-none transition-all duration-200 bg-white pr-10 ${cvvFocused ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-orange-200'}`}
                      />
                      <label
                        htmlFor="cardCVV"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none select-none text-[10px] font-semibold tracking-wide top-1.5 ${cvvFocused ? 'text-orange-500' : 'text-gray-400'}`}
                      >
                        CVV
                      </label>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowCvv(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-400 transition-colors"
                      >
                        {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Installments */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcelas</p>
                  <RadioGroup
                    value={installments}
                    onValueChange={setInstallments}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[
                      { v: '1', main: `1× de R$ ${total.toFixed(2)}`, sub: 'à vista' },
                      { v: '2', main: `2× de R$ ${(total / 2).toFixed(2)}`, sub: 'sem juros' },
                      { v: '3', main: `3× de R$ ${(total / 3).toFixed(2)}`, sub: 'sem juros' },
                      { v: '6', main: `6× de R$ ${(total / 6).toFixed(2)}`, sub: 'sem juros' },
                    ].map(opt => (
                      <Label
                        key={opt.v}
                        htmlFor={`inst-${opt.v}`}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          installments === opt.v
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <RadioGroupItem id={`inst-${opt.v}`} value={opt.v} className="text-orange-500 border-orange-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{opt.main}</p>
                          <p className="text-[11px] text-green-600 font-medium">{opt.sub}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Dados criptografados com TLS 1.3 · PCI-DSS nível 1
                </div>
              </div>
            )}

            {/* PIX form */}
            {paymentMethod === 'pix' && (
              <div className="px-6 pb-6 pt-5">
                <div className="flex flex-col items-center gap-5">
                  {/* QR container */}
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-br from-orange-200/40 via-amber-200/40 to-red-200/40 rounded-3xl blur-xl" />
                    <div className="relative bg-white rounded-3xl p-4 shadow-lg border border-orange-100">
                      <PixQRCode />
                      {/* Logo overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-xl p-1.5 shadow-md border border-orange-200">
                          <Coffee className="h-5 w-5 text-orange-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      R$ {total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Valor total a pagar</p>
                  </div>

                  {/* Timer */}
                  <PixTimer />

                  {/* Steps */}
                  <div className="w-full space-y-2">
                    {[
                      { n: '1', text: 'Abra o app do seu banco ou carteira digital' },
                      { n: '2', text: 'Escaneie o QR Code ou copie a chave abaixo' },
                      { n: '3', text: 'Confirme o pagamento no seu app' },
                    ].map(step => (
                      <div key={step.n} className="flex items-center gap-3 bg-orange-50/60 rounded-xl px-4 py-2.5">
                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {step.n}
                        </span>
                        <p className="text-sm text-gray-600">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Copy key */}
                  <div className="w-full space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chave PIX</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value="cafehub@pagamentos.pix"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none select-all"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className={`flex-shrink-0 rounded-xl border-2 px-4 font-semibold transition-all duration-300 ${
                          copied
                            ? 'border-green-400 bg-green-50 text-green-600'
                            : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                        }`}
                      >
                        {copied
                          ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Copiado!</>
                          : <><Copy className="h-4 w-4 mr-1.5" /> Copiar</>
                        }
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3 w-full">
                    <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Transação protegida pelo Banco Central do Brasil
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Right: Order Summary ── */}
        <aside className="lg:sticky lg:top-[88px] space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Summary header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Resumo do Pedido</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'}</p>
            </div>

            {/* Items */}
            <div className="px-6 py-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 items-center group">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-2xl shadow-sm"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.origin}</p>
                    <p className="text-xs text-gray-400">R$ {item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800 text-sm flex-shrink-0">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-orange-50" />

            {/* Coupon */}
            <div className="px-6 py-3">
              <button
                onClick={() => setCouponOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                <Tag className="h-4 w-4" />
                Tenho um cupom de desconto
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${couponOpen ? 'rotate-180' : ''}`} />
              </button>
              {couponOpen && (
                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="EX: CAFE10"
                    value={form.coupon}
                    onChange={e => set('coupon', e.target.value.toUpperCase())}
                    className="flex-1 border border-orange-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                  />
                  <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-sm px-4">
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-orange-50" />

            {/* Totals */}
            <div className="px-6 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete</span>
                {frete === 0
                  ? <span className="font-semibold text-green-600">Grátis</span>
                  : <span className="font-medium text-gray-700">R$ {frete.toFixed(2)}</span>
                }
              </div>
              {frete === 0 && (
                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                  Parabéns! Você ganhou frete grátis
                </div>
              )}

              <div className="flex justify-between items-end pt-2 border-t border-dashed border-orange-200 mt-2">
                <span className="font-bold text-gray-800">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    R$ {total.toFixed(2)}
                  </p>
                  {paymentMethod === 'card' && installments !== '1' && (
                    <p className="text-xs text-gray-400">
                      {installments}× de R$ {(total / Number(installments)).toFixed(2)} s/juros
                    </p>
                  )}
                  {paymentMethod === 'pix' && (
                    <p className="text-xs text-green-600 font-medium">via PIX</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 py-6 text-base font-bold rounded-2xl shadow-lg shadow-orange-200"
                onClick={() => onConfirm({ orderNumber, total, paymentMethod, installments })}
              >
                <Lock className="h-4 w-4 mr-2 opacity-80" />
                {paymentMethod === 'pix' ? 'Confirmar pagamento PIX' : `Pagar R$ ${total.toFixed(2)}`}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {['VISA', 'MASTER', 'PIX'].map(b => (
                  <span key={b} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-bold tracking-wider">
                    {b}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}
                </div>
                <span>4.9 · 50k+ clientes</span>
              </div>
            </div>
          </div>

          {/* Delivery badge */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl flex-shrink-0">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Entrega estimada</p>
              <p className="text-xs text-gray-500 mt-0.5">30 – 45 minutos após confirmação</p>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
