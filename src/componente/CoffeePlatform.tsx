import { useState, useEffect } from 'react';
import { Coffee, Star, ShoppingCart, Heart, ArrowRight, MapPin, Clock, Award, Users, Zap, Gift } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CoffeePlatform() {
  const [] = useState('home');
  const [cartItems, setCartItems] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coffeeProducts = [
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

  const toggleFavorite = (id: unknown) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const addToCart = () => {
    setCartItems(cartItems + 1);
  };

  const stats = [
    { icon: Users, value: "50K+", label: "Clientes Felizes" },
    { icon: Award, value: "98%", label: "Satisfação" },
    { icon: Coffee, value: "200+", label: "Variedades" },
    { icon: Zap, value: "24/7", label: "Disponível" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-orange-100 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                CaféLux
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Início', 'Cardápio', 'Sobre', 'Contato'].map((item, index) => (
                <button
                  key={item}
                  className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 hover:scale-105 relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-orange-100 rounded-lg transition-all duration-300 hover:scale-110">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    Café
                  </span>
                  <br />
                  <span className="text-gray-800">Extraordinário</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Descubra sabores únicos de grãos selecionados do mundo todo. 
                  Uma experiência sensorial incomparável te espera.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={addToCart}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Explorar Cardápio</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-orange-300 text-orange-600 px-8 py-4 rounded-2xl font-semibold hover:bg-orange-50 hover:scale-105 transition-all duration-300">
                  Saiba Mais
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className={`text-center transition-all duration-700 hover:scale-110 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }}>
                    <stat.icon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl transform rotate-6 animate-pulse"></div>
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

      {/* Products Section */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Nossos <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Destaques</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada xícara conta uma história única de sabor e tradição
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coffeeProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <Heart 
                      className={`h-5 w-5 transition-colors duration-300 ${
                        favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`} 
                    />
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
                    <button
                      onClick={addToCart}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
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
            ].map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ animationDelay: `${index * 200 + 600}ms` }}
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

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para uma experiência única?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de amantes de café que já descobriram o sabor incomparável
          </p>
          <button 
            onClick={addToCart}
            className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
          >
            <span>Começar Agora</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CaféLux</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transformando momentos ordinários em experiências extraordinárias através do café.
              </p>
            </div>
            
            {[
              {
                title: "Produtos",
                items: ["Cafés Premium", "Cold Brew", "Acessórios", "Assinaturas"]
              },
              {
                title: "Empresa",
                items: ["Sobre Nós", "Sustentabilidade", "Carreiras", "Blog"]
              },
              {
                title: "Suporte",
                items: ["Central de Ajuda", "Contato", "FAQ", "Delivery"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CaféLux. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Notification */}
      {cartItems > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Alert className="bg-green-500 text-white border-green-600">
            <Gift className="h-4 w-4" />
            <AlertDescription>
              Item adicionado ao carrinho! 🎉
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

