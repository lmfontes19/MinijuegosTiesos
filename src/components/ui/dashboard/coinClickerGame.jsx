'use client'
import { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Trophy, Target, Skull, Coins
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
  const [gameSpeed, setGameSpeed] = useState(1); // Multiplicador de velocidad
  
  // Estado del juego
  const [monkey, setMonkey] = useState({ x: 50, y: 5 });
  const [objects, setObjects] = useState([]);

  // Cargar high score
  useEffect(() => {
    const currentHighScore = getHighScore('coinClicker');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  // Función para manejar clicks en objetos
  const handleObjectClick = (objectId, objectType) => {
    if (gameState !== 'playing') return;
    
    if (objectType === 'coin') {
      setScore(prev => prev + 1);
      // Remover la moneda clickeada
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
    } else {
      // Bomba clickeada - game over
      setGameState('gameOver');
      // Verificar y actualizar high score
      if (score > highScore) {
        setIsNewRecord(true);
        updateHighScore('coinClicker', score);
        setHighScore(score);
      }
    }
  };

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

    const gameLoop = (currentTime) => {
      
      // Calcular velocidad progresiva basada en el score
      const currentGameSpeed = 1 + Math.floor(score / 5) * 0.2; // Aumenta cada 5 puntos
      setGameSpeed(currentGameSpeed);
      
      // Mover mono (movimiento sinusoidal más dinámico)
      const time = currentTime / (1200 / currentGameSpeed); // Se mueve más rápido con el tiempo
      const newMonkeyX = 50 + Math.sin(time) * 35; // oscila entre 15% y 85%
      const clampedMonkeyX = Math.max(10, Math.min(90, newMonkeyX));
      
      // Actualizar posición del mono
      setMonkey(prev => {
        const updatedMonkey = { ...prev, x: clampedMonkeyX };
        
        // Spawn objetos más frecuente conforme aumenta velocidad
        const spawnInterval = Math.max(800, 2000 - (currentGameSpeed - 1) * 200);
        if (currentTime - lastSpawnRef.current > spawnInterval) {
          const isCoin = Math.random() < 0.7;
          const baseSpeed = 0.8 + (currentGameSpeed - 1) * 0.3; // Velocidad base que aumenta
          const newObject = {
            id: `obj_${objectIdRef.current++}`,
            x: updatedMonkey.x, // Usar la posición EXACTA del mono actualizada
            y: 8, // Empezar más cerca del mono para que se vea claramente que salen de él
            type: isCoin ? 'coin' : 'bomb',
            speed: baseSpeed + Math.random() * 0.4 // Variación en velocidad
          };
          setObjects(prev => [...prev, newObject]);
          lastSpawnRef.current = currentTime;
        }
        
        return updatedMonkey;
      });

      // Mover objetos y detectar si salen de pantalla
      setObjects(prev => {
        return prev.map(obj => ({
          ...obj,
          y: obj.y + obj.speed * currentGameSpeed // Aplicar multiplicador de velocidad
        })).filter(obj => {
          // Si el objeto sale del área de juego
          if (obj.y > 100) {
            // Si era una moneda y no la clickeaste, pierdes
            if (obj.type === 'coin') {
              setGameState('gameOver');
              // Verificar y actualizar high score
              if (score > highScore) {
                setIsNewRecord(true);
                updateHighScore('coinClicker', score);
                setHighScore(score);
              }
            }
            return false;
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
  }, [gameState, score, highScore, updateHighScore]);

  // Iniciar juego
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setGameSpeed(1);
    setMonkey({ x: 50, y: 5 });
    setObjects([]);
    lastSpawnRef.current = 0;
    objectIdRef.current = 0;
    setIsNewRecord(false);
  };

  const backToMenu = () => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Pantalla de menú
  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Coins className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Coin Clicker</h1>
            <p className="text-gray-400">
              Haz click en las monedas 🪙 para recogerlas y evita las bombas 💣.<br/>
              <span className="text-sm text-[#F59E0B]">¡La velocidad aumenta cada 5 puntos!</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155] text-center">
              <Target className="w-5 h-5 text-[#F59E0B] mx-auto mb-3" />
              <div className="text-white font-medium">Objetivo</div>
              <div className="text-gray-400">Click en 🪙 evitar 💣</div>
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
            {gameState === 'playing' && (
              <div className="flex items-center">
                <div className="w-5 h-5 text-[#6366F1] mr-2">⚡</div>
                <span className="text-white font-medium">Velocidad: {gameSpeed.toFixed(1)}x</span>
              </div>
            )}
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
              <div className="text-gray-400">Puntuación final</div>
              <div className="text-3xl font-bold text-[#F59E0B]">{score} monedas</div>
              {isNewRecord && (
                <div className="text-[#10B981] font-medium">¡Nuevo récord!</div>
              )}
            </div>
            <div className="flex gap-3">
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
          <h3 className="text-xl font-bold text-white mb-2">¡Haz click en las monedas y evita las bombas!</h3>
          <p className="text-gray-400 text-sm">
            Usa el mouse para hacer click • La velocidad aumenta gradualmente
          </p>
        </div>
        
        {/* Game Area */}
        <div 
          className="relative bg-gradient-to-b from-[#475569] via-[#334155] to-[#1E293B] rounded-lg border-2 border-[#64748B] overflow-hidden shadow-inner"
          style={{ height: '500px', width: '100%' }}
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#654321] rounded-full flex items-center justify-center text-3xl font-bold border-4 border-[#A0522D] shadow-xl">
              🐵
            </div>
          </div>

          {/* Objetos cayendo - Clickeables */}
          {objects.map(obj => (
            <div
              key={obj.id}
              className="absolute z-20 cursor-pointer hover:scale-110 transition-transform duration-100"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleObjectClick(obj.id, obj.type)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl border-2 ${
                obj.type === 'coin' 
                  ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] border-[#FBBF24] hover:from-[#FEF08A] hover:to-[#FCD34D]' 
                  : 'bg-gradient-to-br from-[#1F2937] to-[#111827] border-[#374151] hover:from-[#374151] hover:to-[#1F2937]'
              }`}>
                {obj.type === 'coin' ? '🪙' : '💣'}
              </div>
            </div>
          ))}

          {/* Indicador de área clickeable */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
              Haz click en los objetos que caen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinClickerGame;