'use client'
import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Settings, Trophy, Clock, Target, Star, Play, Pause } from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const MemoramaGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'finished'
  const [difficulty, setDifficulty] = useState(16); // 16, 20, 24, 28, 32 cartas
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Imágenes para las cartas (usando imágenes de la carpeta memorama)
  const cardImages = [
    { src: '/memorama/burger.png', alt: 'Burger', name: 'burger', color: '#F59E0B' },
    { src: '/memorama/pintora.png', alt: 'Pintora', name: 'pintora', color: '#EF4444' },
    { src: '/memorama/luchador.png', alt: 'Luchador', name: 'luchador', color: '#10B981' },
    { src: '/memorama/ajolote.png', alt: 'Ajolote', name: 'ajolote', color: '#6366F1' },
    { src: '/memorama/baby-feeder.png', alt: 'Baby Feeder', name: 'baby-feeder', color: '#F97316' },
    { src: '/memorama/bat.png', alt: 'Bat', name: 'bat', color: '#EC4899' },
    { src: '/memorama/beer.png', alt: 'Beer', name: 'beer', color: '#06B6D4' },
    { src: '/memorama/bible.png', alt: 'Bible', name: 'bible', color: '#92400E' },
    { src: '/memorama/seagull.png', alt: 'Seagull', name: 'seagull', color: '#8B5CF6' },
    { src: '/memorama/sandwich.png', alt: 'Sandwich', name: 'sandwich', color: '#84CC16' },
    { src: '/memorama/cookie.png', alt: 'Cookie', name: 'cookie', color: '#F59E0B' },
    { src: '/memorama/salad.png', alt: 'Salad', name: 'salad', color: '#10B981' },
    { src: '/memorama/pasta.png', alt: 'Pasta', name: 'pasta', color: '#EF4444' },
    { src: '/memorama/fruit.png', alt: 'Fruit', name: 'fruit', color: '#F97316' },
    { src: '/memorama/popcorn.png', alt: 'Popcorn', name: 'popcorn', color: '#FBBF24' },
    { src: '/memorama/pretzel.png', alt: 'Pretzel', name: 'pretzel', color: '#92400E' }
  ];

  // Inicializar cartas
  const initializeCards = useCallback(() => {
    const numPairs = difficulty / 2;
    const selectedImages = cardImages.slice(0, numPairs);
    const cardPairs = [...selectedImages, ...selectedImages];
    
    // Mezclar las cartas
    const shuffledCards = cardPairs
      .map((imageData, index) => ({
        id: index,
        imageData: imageData,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimer(0);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameState]);

  // Cargar mejor tiempo del localStorage
  useEffect(() => {
    const currentBestTime = getHighScore('memorama');
    setBestTime(currentBestTime > 0 ? currentBestTime : null);
  }, [difficulty, getHighScore]);

  // Manejar clic en carta
  const handleCardClick = (cardId) => {
    if (gameState !== 'playing' || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Actualizar cartas
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    // Si se voltearon 2 cartas, verificar coincidencia
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      setTimeout(() => {
        const [firstCardId, secondCardId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstCardId);
        const secondCard = cards.find(c => c.id === secondCardId);

        if (firstCard.imageData.name === secondCard.imageData.name) {
          // Coincidencia encontrada
          const newMatchedCards = [...matchedCards, firstCardId, secondCardId];
          setMatchedCards(newMatchedCards);
          
          setCards(prevCards => 
            prevCards.map(c => 
              newMatchedCards.includes(c.id) 
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );

          // Verificar si el juego terminó
          if (newMatchedCards.length === difficulty) {
            setGameState('finished');
            setIsRunning(false);
            
            // Actualizar mejor tiempo usando el hook
            const wasNewRecord = updateHighScore('memorama', timer);
            setIsNewRecord(wasNewRecord);
            
            if (wasNewRecord) {
              setBestTime(timer);
            }
          }
        } else {
          // No hay coincidencia, voltear cartas de vuelta
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) 
                ? { ...c, isFlipped: false }
                : c
            )
          );
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Iniciar juego
  const startGame = () => {
    initializeCards();
    setGameState('playing');
    setIsRunning(true);
    setIsNewRecord(false);
  };

  // Pausar/Reanudar juego
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      setIsRunning(false);
    } else if (gameState === 'paused') {
      setGameState('playing');
      setIsRunning(true);
    }
  };

  // Reiniciar juego
  const resetGame = () => {
    setGameState('menu');
    setIsRunning(false);
    initializeCards();
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular dimensiones del grid
  const getGridDimensions = () => {
    switch (difficulty) {
      case 16: return 'grid-cols-4';
      case 20: return 'grid-cols-5';
      case 24: return 'grid-cols-6';
      case 28: return 'grid-cols-7';
      case 32: return 'grid-cols-8';
      default: return 'grid-cols-4';
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center">
          <div className="mb-8">
            <div className="bg-[#F59E0B]/10 p-4 rounded-full w-20 h-20 mx-auto mb-4">
              <Target className="w-12 h-12 text-[#F59E0B] mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Memorama</h1>
            <p className="text-gray-400">Encuentra todas las parejas de cartas en el menor tiempo posible</p>
          </div>

          <div className="mb-8">
            <h3 className="text-white font-medium mb-4">Selecciona la dificultad</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[16, 20, 24, 28, 32].map(num => (
                <button
                  key={num}
                  onClick={() => setDifficulty(num)}
                  className={`p-3 rounded-lg border transition-all ${
                    difficulty === num
                      ? 'bg-[#F59E0B] border-[#F59E0B] text-white'
                      : 'bg-[#0F172A] border-[#334155] text-gray-400 hover:border-[#F59E0B]'
                  }`}
                >
                  <div className="text-lg font-bold">{num}</div>
                  <div className="text-xs">cartas</div>
                </button>
              ))}
            </div>
          </div>

          {bestTime && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#F59E0B] mr-2" />
                <span className="text-white">Mejor tiempo ({difficulty} cartas): </span>
                <span className="text-[#F59E0B] font-bold ml-1">{formatTime(bestTime)}</span>
              </div>
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
          >
            <Play className="w-5 h-5 mr-2" />
            Comenzar Juego
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header del juego */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-[#6366F1] mr-2" />
              <span className="text-white font-medium">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center">
              <Target className="w-5 h-5 text-[#10B981] mr-2" />
              <span className="text-white font-medium">{moves} movimientos</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium">{matchedCards.length / 2}/{difficulty / 2} parejas</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePause}
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetGame}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pantalla de pausa */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center">
            <Pause className="w-16 h-16 text-[#6366F1] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Juego Pausado</h2>
            <button
              onClick={togglePause}
              className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Pantalla de juego terminado */}
      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center max-w-md">
            <Trophy className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">¡Felicidades!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">Tiempo: <span className="text-[#F59E0B] font-bold">{formatTime(timer)}</span></p>
              <p className="text-gray-300">Movimientos: <span className="text-[#10B981] font-bold">{moves}</span></p>
              {isNewRecord && (
                <p className="text-[#F59E0B] font-bold flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  ¡Nuevo récord!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                Jugar de nuevo
              </button>
              <button
                onClick={resetGame}
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de cartas */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6">
        <div className={`grid ${getGridDimensions()} gap-3 max-w-4xl mx-auto`}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105 relative ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-br from-black via-gray-500 to-gray-900 border-[#F59E0B] shadow-xl'
                  : 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-[#334155] hover:border-[#F59E0B] shadow-lg'
              } border-2 flex items-center justify-center overflow-hidden`}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="w-full h-full p-2">
                  <img 
                    src={card.imageData.src}
                    alt={card.imageData.alt}
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      // Fallback si la imagen no se puede cargar
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg hidden items-center justify-center"
                    style={{ backgroundColor: card.imageData.color }}
                  >
                    <span className="text-white font-bold text-lg">{card.imageData.alt[0]}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#334155] to-[#475569] rounded-lg opacity-60 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#1E293B] rounded opacity-80"></div>
                  </div>
                </div>
              )}
              
              {/* Efecto de brillo para cartas emparejadas */}
              {card.isMatched && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F59E0B]/20 to-transparent rounded-xl animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};