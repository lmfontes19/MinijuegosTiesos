'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid, Settings, Menu, X, Loader, Gamepad2
} from 'lucide-react';

import { DashboardContent } from '@/components/ui/dashboard/dashboardContent';
import { SettingsContent } from '@/components/ui/dashboard/settingsContent';
import { MemoramaGame } from '@/components/ui/dashboard/memoramaGame';
import { CoinClickGame } from '@/components/ui/dashboard/coinClickerGame';
import { SnakeGame } from '@/components/ui/dashboard/snakeGame';
import { FlappyBirdGame } from '@/components/ui/dashboard/flappyBirdGame';
import { SpacingLayerGame } from '@/components/ui/dashboard/spacingLayerGame';

import { useChat } from '@/contexts/ChatContext';
import { useGameHighScores } from '@/hooks/useGameHighScores';

const DashboardPage = () => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    fullName: '',
    profilePicture: null
  });

  const { isChatOpen } = useChat();
  const { highScores } = useGameHighScores();

  // --- SLIDER DE ANUNCIOS --- //
  const imagesAd1 = ["/ads/ad1-1.jpg", "/ads/ad1-2.jpg"];
  const imagesAd2 = ["/ads/ad2-1.jpg", "/ads/ad2-2.jpg"];

  const [ad1Index, setAd1Index] = useState(0);
  const [ad2Index, setAd2Index] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAd1Index(prev => (prev + 1) % imagesAd1.length);
      setAd2Index(prev => (prev + 1) % imagesAd2.length);
    }, 5000); // cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('CTtoken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/navbar/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          localStorage.removeItem('CTtoken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userProfilePicture');
          router.push('/login');
          return;
        }
        
        await loadUserData();
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('CTtoken');
        router.push('/login');
      }
    };

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const savedProfilePicture = localStorage.getItem('userProfilePicture');
        if (savedProfilePicture) {
          setUserData(prev => ({
            ...prev,
            profilePicture: { preview: savedProfilePicture }
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = [
        'dashboard', 'settings', 'memorama', 'coinclick', 'snakegame', 'flappybird', 'spacinglayer'
      ];
      
      if (hash && validViews.includes(hash)) {
        setCurrentView(hash);
      } else if (!hash) {
        setCurrentView('dashboard');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('CTtoken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfilePicture');
    router.push('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderContent = () => {
    switch (currentView) {
      case 'settings': return <SettingsContent />;
      case 'memorama': return <MemoramaGame />;
      case 'coinclick': return <CoinClickGame />;
      case 'snakegame': return <SnakeGame />;
      case 'flappybird': return <FlappyBirdGame />;
      case 'spacinglayer': return <SpacingLayerGame />;
      default: return <DashboardContent highScores={highScores} />;
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'memorama', label: 'Memorama', icon: Gamepad2 },
    { id: 'coinclick', label: 'CoinClick', icon: Gamepad2 },
    { id: 'snakegame', label: 'Snake Game', icon: Gamepad2 },
    { id: 'flappybird', label: 'Flappy Bird', icon: Gamepad2 },
    { id: 'spacinglayer', label: 'Spacing Layer', icon: Gamepad2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
    setIsMenuOpen(false);
    window.location.hash = viewId === 'dashboard' ? '' : viewId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-10 h-10 text-[#6366F1] animate-spin mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] min-h-screen text-gray-200 flex flex-col relative">
      
      {/* SIDEBAR */}
      <aside className={`fixed top-16 bottom-0 left-0 z-20 w-64 bg-[#0F172A] md:bg-[#0F172A]/80 md:backdrop-blur-md border-r border-[#1E293B] transform ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto`}>
        
        <div className="p-4 h-full flex flex-col">
          <div className="flex-1 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleViewChange(link.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                  currentView === link.id 
                    ? 'bg-[#6366F1] text-white' 
                    : 'text-gray-400 hover:bg-[#1E293B]'
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT + ANUNCIOS */}
      <main className="pt-16 md:pl-64 transition-all duration-300 flex-1 relative z-0 min-h-screen pb-4 md:pb-16">
        
        <div className="flex flex-col xl:flex-row gap-4 md:gap-6">

          {/* CONTENIDO PRINCIPAL */}
          <div 
            className={`flex-1 p-2 md:p-4 lg:p-6 w-full xl:max-w-7xl mx-auto chat-open-adjustment transition-transform duration-300 ${
              isChatOpen ? 'xl:transform xl:-translate-x-[225px]' : ''
            }`}
          >
            {renderContent()}
          </div>

          {/* 🟣 COLUMNA DERECHA DE ANUNCIOS (SLIDER) - Responsive */}
          <aside className="w-full xl:w-[260px] xl:min-w-[260px]">
            {/* Mobile ads - horizontal layout */}
            <div className="xl:hidden flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 bg-[#1E293B]/60 border border-white/10 p-3 rounded-lg shadow-lg">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={imagesAd1[ad1Index]}
                    alt="Ad 1"
                    className="w-full h-40 sm:h-32 object-cover transition-opacity duration-500"
                  />
                </div>
                <p className="text-center text-xs text-white/60 mt-2">
                  Simulated Advertisement
                </p>
              </div>
              <div className="flex-1 bg-[#1E293B]/60 border border-white/10 p-3 rounded-lg shadow-lg">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={imagesAd2[ad2Index]}
                    alt="Ad 2"
                    className="w-full h-40 sm:h-32 object-cover transition-opacity duration-500"
                  />
                </div>
                <p className="text-center text-xs text-white/60 mt-2">
                  Simulated Advertisement
                </p>
              </div>
            </div>
            
            {/* Desktop ads - vertical layout */}
            <div className="hidden xl:block bg-[#1E293B]/60 border border-white/10 p-4 rounded-lg shadow-lg h-fit sticky top-24 space-y-6">
              {/* Slider 1 */}
              <div className="rounded-lg overflow-hidden shadow-lg bg-black/20">
                <img 
                  src={imagesAd1[ad1Index]}
                  alt="Ad 1"
                  className="w-full rounded-lg transition-opacity duration-500"
                />
                <p className="text-center text-xs text-white/60 mt-2">
                  Simulated Advertisement
                </p>
              </div>

              {/* Slider 2 */}
              <div className="rounded-lg overflow-hidden shadow-lg bg-black/20">
                <img 
                  src={imagesAd2[ad2Index]}
                  alt="Ad 2"
                  className="w-full rounded-lg transition-opacity duration-500"
                />
                <p className="text-center text-xs text-white/60 mt-2">
                  Simulated Advertisement
                </p>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Mobile menu toggle button */}
      <button 
        className="md:hidden fixed top-20 left-4 z-30 bg-[#1E293B] p-2 rounded-lg text-white shadow-lg"
        onClick={toggleMenu}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-10"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardPage;
