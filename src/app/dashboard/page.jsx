'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid, Settings, Menu, X, Loader, Gamepad2, Trophy
} from 'lucide-react';
import { DashboardContent } from '@/components/ui/dashboard/dashboardContent';
import { SettingsContent } from '@/components/ui/dashboard/settingsContent';
import { MemoramaGame } from '@/components/ui/dashboard/memoramaGame';
import { CoinClickGame } from '@/components/ui/dashboard/coinClickerGame';
import { SnakeGame } from '@/components/ui/dashboard/snakeGame';
import { FlappyBirdGame } from '@/components/ui/dashboard/flappyBirdGame';
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
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('CTtoken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        // Verificar el token con el backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/navbar/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          // Si el token no es válido, redirigir al login
          localStorage.removeItem('CTtoken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userProfilePicture');
          router.push('/login');
          return;
        }
        
        // Si el token es válido, cargar los datos del usuario
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
        // Get profile picture if available
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
    
    // Cleanup mobile menu when resizing
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  // Manejar el hash de la URL para cambiar la vista
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = [
        'dashboard', 'settings', 'memorama', 'coinclick', 'snakegame', 'flappybird'
      ];
      
      if (hash && validViews.includes(hash)) {
        setCurrentView(hash);
      } else if (!hash) {
        setCurrentView('dashboard');
      }
    };

    // Verificar el hash al cargar inicialmente
    handleHashChange();

    // Escuchar los cambios de hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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
      default: return <DashboardContent highScores={highScores} />;
    }
  };

  // Navigation links
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'memorama', label: 'Memorama', icon: Gamepad2 },
    { id: 'coinclick', label: 'CoinClick', icon: Gamepad2 },
    { id: 'snakegame', label: 'Snake Game', icon: Gamepad2 },
    { id: 'flappybird', label: 'Flappy Bird', icon: Gamepad2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Actualizar el hash de la URL al cambiar de vista
  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
    setIsMenuOpen(false);
    window.location.hash = viewId === 'dashboard' ? '' : viewId;
  };

  // Click outside handler
  useEffect(() => {
    // Cleanup mobile menu when resizing
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state
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
      {/* Sidebar */}
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
          
          {/* High Scores card */}
          
        </div>
      </aside>

      {/* Main content */}
      <main className="pt-16 md:pl-64 transition-all duration-300 flex-1 relative z-0 min-h-screen pb-16">
        <div 
          className={`p-4 md:p-6 max-w-7xl mx-auto chat-open-adjustment ${
            isChatOpen ? 'transform -translate-x-[225px]' : ''
          }`}
        >
          {renderContent()}
        </div>
      </main>

      {/* Mobile menu toggle button */}
      <button 
        className="md:hidden fixed top-20 left-4 z-30 bg-[#1E293B] p-2 rounded-lg text-white shadow-lg"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile nav overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-10"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default DashboardPage;