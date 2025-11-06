'use client'
import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Trophy, Star, ArrowLeft, ArrowRight, 
  Target, Gift, Skull, Coins
} from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const CoinClickerGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const animationRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const objectIdRef = useRef(0);
  
  // Estados del juego
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  // Estado del juego
  const [player, setPlayer] = useState({ x: 50, y: 85 }); // posición en %
  const [monkey, setMonkey] = useState({ x: 50, y: 5 });
  const [objects, setObjects] = useState([]);

  // Cargar high score
  useEffect(() => {
    const currentHighScore = getHighScore('coinClicker');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  // Manejar teclas
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setPlayer(prev => ({ ...prev, x: Math.max(5, prev.x - 8) }));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setPlayer(prev => ({ ...prev, x: Math.min(90, prev.x + 8) }));
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Manejar restart con R
  useEffect(() => {
    if (gameState !== 'gameOver') return;

    const handleRestart = (e) => {
      if (e.key.toLowerCase() === 'r') {
        startGame();
      }
    };
    
    window.addEventListener('keydown', handleRestart);
    return () => window.removeEventListener('keydown', handleRestart);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const currentTime = Date.now();
      
      // Mover mono (movimiento sinusoidal)
      const time = currentTime / 1000;
      const newMonkeyX = 50 + Math.sin(time) * 35; // oscila entre 15% y 85%
      setMonkey(prev => ({ ...prev, x: Math.max(10, Math.min(85, newMonkeyX)) }));

      // Spawn objetos cada 2 segundos
      if (currentTime - lastSpawnRef.current > 2000) {
        const isCoin = Math.random() < 0.7;
        const newObject = {
          id: `obj_${objectIdRef.current++}`,
          x: newMonkeyX,
          y: 10,
          type: isCoin ? 'coin' : 'bomb',
          speed: 0.8
        };
        setObjects(prev => [...prev, newObject]);
        lastSpawnRef.current = currentTime;
      }

      // Mover objetos y detectar colisiones
      setObjects(prev => {
        return prev.map(obj => ({
          ...obj,
          y: obj.y + obj.speed
        })).filter(obj => {
          // Eliminar objetos que salen del área
          if (obj.y > 100) return false;
          
          // Verificar colisiones
          const distance = Math.sqrt(
            Math.pow(obj.x - player.x, 2) + Math.pow(obj.y - player.y, 2)
          );
          
          if (distance < 8) { // Colisión detectada
            if (obj.type === 'coin') {
              setScore(s => s + 1);
            } else {
              // Game over
              setGameState('gameOver');
              const newScore = score + (obj.type === 'coin' ? 1 : 0);
              const wasNewRecord = updateHighScore('coinClicker', newScore);
              setIsNewRecord(wasNewRecord);
              if (wasNewRecord) {
                setHighScore(newScore);
              }
            }
            return false; // Remover objeto
          }
          return true;
        });
      });

      if (gameState === 'playing') {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, player.x, player.y, score, updateHighScore]);

  // Iniciar juego
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayer({ x: 50, y: 85 });
    setMonkey({ x: 50, y: 5 });
    setObjects([]);
    lastSpawnRef.current = 0;
    objectIdRef.current = 0;
    setIsNewRecord(false);
  };

  // Volver al menú
  const backToMenu = () => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center">
          <div className="mb-8">
            <div className="bg-[#F59E0B]/10 p-4 rounded-full w-20 h-20 mx-auto mb-4">
              <Coins className="w-12 h-12 text-[#F59E0B] mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Monkey Coin Collector</h1>
            <p className="text-gray-400">
              Mueve al jugador para recoger monedas doradas y evita las bombas rojas.
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#F59E0B] mr-2" />
                <span className="text-white">Mejor puntuación: </span>
                <span className="text-[#F59E0B] font-bold ml-1">{highScore} monedas</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8">
            <div className="bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <div className="flex items-center justify-center mb-3">
                <ArrowLeft className="w-5 h-5 text-[#6366F1] mr-2" />
                <ArrowRight className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div className="text-white font-medium">Controles</div>
              <div className="text-gray-400">Flechas ← → para moverte</div>
            </div>
            <div className="bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <Target className="w-5 h-5 text-[#F59E0B] mx-auto mb-3" />
              <div className="text-white font-medium">Objetivo</div>
              <div className="text-gray-400">Recoger 🟡 evitar �</div>
            </div>
          </div>

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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header del juego */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium">Puntuación: {score}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-5 h-5 text-[#10B981] mr-2" />
              <span className="text-white font-medium">Récord: {highScore}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={backToMenu}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pantalla de game over */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center max-w-md">
            <Skull className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">¡Juego Terminado!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                Puntuación final: <span className="text-[#F59E0B] font-bold">{score}</span>
              </p>
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
                onClick={backToMenu}
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                Menú
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              O presiona <kbd className="bg-[#334155] px-2 py-1 rounded text-white">R</kbd> para reiniciar
            </p>
          </div>
        </div>
      )}

      {/* Área de juego */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-2">¡Recolecta monedas y evita las bombas!</h3>
          <p className="text-gray-400 text-sm">
            Usa las flechas ← → para moverte
          </p>
        </div>
        
        {/* Game Area */}
        <div 
          className="relative bg-gradient-to-b from-[#475569] via-[#334155] to-[#1E293B] rounded-lg border-2 border-[#64748B] overflow-hidden shadow-inner"
          style={{ height: '400px', width: '100%' }}
        >
          {/* Mono */}
          <div
            className="absolute transition-all duration-100 ease-linear z-10"
            style={{
              left: `${monkey.x}%`,
              top: `${monkey.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center text-sm font-bold border-2 border-[#FBBF24] shadow-lg">
              🐒
            </div>
          </div>

          {/* Jugador */}
          <div
            className="absolute transition-all duration-200 ease-out z-10"
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-8 h-6 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center text-sm border-2 border-[#34D399] shadow-lg">
              🎮
            </div>
          </div>

          {/* Objetos cayendo */}
          {objects.map(obj => (
            <div
              key={obj.id}
              className="absolute transition-all duration-75 ease-linear z-5"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg border ${
                obj.type === 'coin' 
                  ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] border-[#FBBF24]' 
                  : 'bg-gradient-to-br from-[#EF4444] to-[#DC2626] border-[#F87171]'
              }`}>
                {obj.type === 'coin' ? '🟡' : '�'}
              </div>
            </div>
          ))}

          {/* Puntuación overlay */}
          <div className="absolute top-4 left-4 bg-black/60 rounded-lg px-3 py-2 border border-[#334155]">
            <span className="text-white font-bold text-sm">Score: {score}</span>
          </div>

          {/* Instrucciones */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 rounded-lg px-4 py-2 border border-[#334155]">
            <span className="text-white text-xs">← → para mover</span>
          </div>
        </div>
      </div>
    </div>
  );
};