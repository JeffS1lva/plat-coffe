import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckoutPage, type OrderDetails } from './CheckoutPage';
import { OrderTracking } from './OrderTracking';
import {
  Coffee, Star, ShoppingCart, Heart, ArrowRight,
  MapPin, Clock, Award, Users, Zap, Gift,
  Plus, Minus, Trash2, Package, ChevronRight,
  History, Truck, CheckCircle2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  SheetFooter,
} from '@/components/ui/sheet';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  origin: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ActiveOrder {
  details: OrderDetails;
  items: CartItem[];
  step: number;
}

interface HistoryEntry {
  details: OrderDetails;
  items: CartItem[];
  completedAt: Date;
}

const STEP_LABELS = ['Pedido aceito', 'Preparando', 'A caminho'];

const coffeeProducts: Product[] = [
  {
    id: 1,
    name: "Espresso Supremo",
    price: 28.90,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=300&fit=crop",
    description: "Blend exclusivo com notas de chocolate e caramelo",
    origin: "Brasil/Colômbia"
  },
  {
    id: 2,
    name: "Cold Brew Premium",
    price: 32.90,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&h=300&fit=crop",
    description: "Extração a frio por 24h, sabor intenso e suave",
    origin: "Etiópia"
  },
  {
    id: 3,
    name: "Cappuccino Artesanal",
    price: 24.90,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop",
    description: "Cremoso e aveludado com arte em leite",
    origin: "Itália/Brasil"
  },
  {
    id: 4,
    name: "Mocha Deluxe",
    price: 26.90,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
    description: "Chocolate belga com café premium",
    origin: "Bélgica/Jamaica"
  }
];

const stats = [
  { icon: Users, value: "50K+", label: "Clientes Felizes" },
  { icon: Award, value: "98%", label: "Satisfação" },
  { icon: Coffee, value: "200+", label: "Variedades" },
  { icon: Zap, value: "24/7", label: "Disponível" }
];

const features = [
  {
    icon: MapPin,
    title: "Origem Rastreável",
    description: "Conheça a jornada completa do seu café, desde a fazenda até sua xícara"
  },
  {
    icon: Clock,
    title: "Entrega Expressa",
    description: "Receba seu café favorito fresquinho em até 30 minutos"
  },
  {
    icon: Gift,
    title: "Programa Fidelidade",
    description: "Acumule pontos e ganhe cafés gratuitos a cada compra"
  }
];

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function CoffeePlatform() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<'main' | 'checkout' | 'tracking'>('main');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} adicionado!`, {
      description: `R$ ${product.price.toFixed(2)}`,
      action: { label: 'Ver carrinho', onClick: () => setCartOpen(true) },
    });
  };

  const removeFromCart = (id: number) => {
    const item = cart.find(i => i.id === id);
    setCart(prev => prev.filter(i => i.id !== id));
    if (item) toast.error(`${item.name} removido do carrinho`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => { setCart([]); toast.info('Carrinho esvaziado'); };

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) { next.delete(product.id); toast('Removido dos favoritos', { icon: '🤍' }); }
      else { next.add(product.id); toast('Adicionado aos favoritos', { icon: '❤️' }); }
      return next;
    });
  };

  /* ─── Views ─── */
  if (view === 'tracking' && activeOrder) {
    return (
      <OrderTracking
        orderNumber={activeOrder.details.orderNumber}
        total={activeOrder.details.total}
        paymentMethod={activeOrder.details.paymentMethod}
        installments={activeOrder.details.installments}
        items={activeOrder.items}
        initialStep={activeOrder.step}
        onStepChange={(step) => setActiveOrder(prev => prev ? { ...prev, step } : prev)}
        onGoBack={() => setView('main')}
        onFinish={() => {
          setOrderHistory(prev => [
            { details: activeOrder.details, items: activeOrder.items, completedAt: new Date() },
            ...prev,
          ]);
          setActiveOrder(null);
          setView('main');
          toast.success('Pedido entregue! Obrigado pela preferência.');
        }}
      />
    );
  }

  if (view === 'checkout') {
    return (
      <CheckoutPage
        cart={cart}
        onBack={() => setView('main')}
        onConfirm={(details) => {
          const capturedItems = [...cart];
          setCart([]);
          setActiveOrder({ details, items: capturedItems, step: 0 });
          setView('tracking');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">

      {/* ── Header ── */}
      <header
        className={`fixed w-full top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-orange-100 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <button onClick={() => scrollTo('inicio')} className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">CaféHub</span>
            </button>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href.slice(1))}
                  className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* History button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-orange-100 hover:scale-110 transition-all duration-300"
                onClick={() => setHistoryOpen(true)}
                aria-label="Histórico de pedidos"
              >
                <History className="h-5 w-5 text-gray-700" />
                {orderHistory.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-orange-400 text-white text-[10px]">
                    {orderHistory.length}
                  </Badge>
                )}
              </Button>

              {/* Cart button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-orange-100 hover:scale-110 transition-all duration-300"
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrinho"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-bounce">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Cart Sheet ── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md bg-white">
          <SheetHeader className="border-b border-orange-100 pb-4">
            <SheetTitle className="flex items-center gap-2 text-gray-800">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              Meu Carrinho
              {totalItems > 0 && (
                <Badge className="bg-orange-500 text-white ml-1">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
              <div className="bg-orange-50 p-6 rounded-full">
                <Package className="h-12 w-12 text-orange-300" />
              </div>
              <p className="text-gray-500 font-medium">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm">Explore nosso cardápio e adicione algo especial</p>
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 mt-2"
                onClick={() => { setCartOpen(false); scrollTo('cardapio'); }}
              >
                Ver Cardápio <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 py-4">
                <div className="space-y-4 pr-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 items-center bg-orange-50/60 rounded-2xl p-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-orange-600 font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline" size="icon"
                          className="h-7 w-7 rounded-lg border-orange-200 hover:bg-orange-100"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5 text-red-400" /> : <Minus className="h-3.5 w-3.5 text-gray-600" />}
                        </Button>
                        <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                        <Button
                          variant="outline" size="icon"
                          className="h-7 w-7 rounded-lg border-orange-200 hover:bg-orange-100"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <SheetFooter className="flex flex-col gap-3 border-t border-orange-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-center">Frete grátis para pedidos acima de R$ 80,00</p>
                <Separator className="bg-orange-100" />
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 hover:scale-[1.02] transition-all duration-200 py-6 text-base font-bold rounded-xl"
                  onClick={() => { setCartOpen(false); setView('checkout'); }}
                >
                  Finalizar Pedido · R$ {subtotal.toFixed(2)} <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="ghost" className="w-full text-gray-400 hover:text-red-400 hover:bg-red-50 text-sm" onClick={clearCart}>
                  Esvaziar carrinho
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── History Sheet ── */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md bg-white">
          <SheetHeader className="border-b border-orange-100 pb-4">
            <SheetTitle className="flex items-center gap-2 text-gray-800">
              <History className="h-5 w-5 text-orange-500" />
              Histórico de Pedidos
            </SheetTitle>
          </SheetHeader>

          {orderHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
              <div className="bg-orange-50 p-6 rounded-full">
                <History className="h-12 w-12 text-orange-200" />
              </div>
              <p className="text-gray-500 font-medium">Nenhum pedido concluído</p>
              <p className="text-gray-400 text-sm">Seus pedidos finalizados aparecerão aqui</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4 pr-2">
                {orderHistory.map((entry, i) => (
                  <div key={i} className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
                      <div>
                        <p className="font-black text-orange-600 text-sm font-mono">{entry.details.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.completedAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-[11px] font-bold text-green-600">Entregue</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-2">
                      {entry.items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-orange-100" />
                          <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                      {entry.items.length > 3 && (
                        <p className="text-xs text-gray-400 pl-12">+{entry.items.length - 3} item(s)</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/60 border-t border-orange-100">
                      <p className="text-xs text-gray-400">
                        {entry.details.paymentMethod === 'pix' ? 'Pago via PIX' : `Cartão · ${entry.details.installments}×`}
                      </p>
                      <p className="font-black text-gray-800">R$ {entry.details.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Hero ── */}
      <section id="inicio" className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent">Café</span>
                  <br />
                  <span className="text-gray-800">Extraordinário</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Descubra sabores únicos de grãos selecionados do mundo todo. Uma experiência sensorial incomparável te espera.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => scrollTo('cardapio')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base group"
                >
                  Explorar Cardápio <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollTo('sobre')}
                  className="border-2 border-orange-300 text-orange-600 px-8 py-6 rounded-2xl font-semibold hover:bg-orange-50 hover:scale-105 transition-all duration-300 text-base"
                >
                  Saiba Mais
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className={`text-center transition-all duration-700 hover:scale-110 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                    <stat.icon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl transform rotate-6 animate-pulse" />
                <div className="relative bg-white p-2 rounded-3xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"
                    alt="Café Premium"
                    className="w-full h-96 object-cover rounded-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="cardapio" className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Nossos <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Destaques</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Cada xícara conta uma história única de sabor e tradição</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coffeeProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button
                    onClick={() => toggleFavorite(product)}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <Heart className={`h-5 w-5 transition-colors duration-300 ${favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.origin}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="sobre" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Por que escolher a <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">CaféHub?</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 200 + 600}ms` }}
              >
                <div className="bg-gradient-to-r from-orange-400 to-red-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contato" className="py-16 px-6 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Pronto para uma experiência única?</h2>
          <p className="text-xl mb-8 opacity-90">Junte-se a milhares de amantes de café que já descobriram o sabor incomparável</p>
          <Button
            onClick={() => scrollTo('cardapio')}
            className="bg-white text-orange-600 px-8 py-6 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
          >
            Começar Agora <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CaféHub</span>
              </div>
              <p className="text-gray-400 leading-relaxed">Transformando momentos ordinários em experiências extraordinárias através do café.</p>
            </div>
            {[
              { title: "Produtos", items: ["Cafés Premium", "Cold Brew", "Acessórios", "Assinaturas"] },
              { title: "Empresa", items: ["Sobre Nós", "Sustentabilidade", "Carreiras", "Blog"] },
              { title: "Suporte", items: ["Central de Ajuda", "Contato", "FAQ", "Delivery"] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map(item => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CaféHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ── Floating active-order bar ── */}
      {activeOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <div className="bg-white border border-orange-200 rounded-2xl shadow-2xl shadow-orange-200/60 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-orange-100 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-[1200ms] ease-in-out"
                  style={{ width: `${((activeOrder.step + 1) / 3) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-4 px-5 py-4">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-200">
                    {activeOrder.step === 2
                      ? <Truck className="h-5 w-5 text-white" />
                      : activeOrder.step === 1
                      ? <Coffee className="h-5 w-5 text-white" />
                      : <CheckCircle2 className="h-5 w-5 text-white" />
                    }
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Pedido em andamento</p>
                  <p className="font-bold text-gray-800 truncate">{STEP_LABELS[activeOrder.step]}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setView('tracking')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-xl px-4 py-2 h-auto hover:opacity-90 transition-opacity shadow-md shadow-orange-200"
                  >
                    Acompanhar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setActiveOrder(null)}
                    aria-label="Dispensar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
