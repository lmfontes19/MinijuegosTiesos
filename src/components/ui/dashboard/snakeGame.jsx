'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Trophy, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Target, Skull, Gamepad2
} from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const SnakeGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(0);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef({ x: 0, y: 0 });
  const nextDirectionRef = useRef({ x: 0, y: 0 });
  const foodRef = useRef({ x: 15, y: 15 });
  const gridSize = 20;
  const cellSize = 20;

  useEffect(() => {
    const currentHighScore = getHighScore('snake');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  const generateFood = () => {
    let newFood;
    let isValid = false;
    while (!isValid) {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      isValid = !snakeRef.current.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const currentDir = directionRef.current;
      if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)) e.preventDefault();

      if ((key === 'arrowleft' || key === 'a') && currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
      else if ((key === 'arrowright' || key === 'd') && currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
      else if ((key === 'arrowup' || key === 'w') && currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
      else if ((key === 'arrowdown' || key === 's') && currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'gameOver') return;
    const handleRestart = (e) => {
      if (e.key.toLowerCase() === 'r') startGame();
    };
    window.addEventListener('keydown', handleRestart);
    return () => window.removeEventListener('keydown', handleRestart);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = (timestamp) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (timestamp - lastUpdateRef.current < 150) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }
      lastUpdateRef.current = timestamp;
      directionRef.current = nextDirectionRef.current;

      if (directionRef.current.x === 0 && directionRef.current.y === 0) {
        draw(ctx);
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const snake = snakeRef.current;
      const head = snake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        endGame();
        return;
      }

      if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        endGame();
        return;
      }

      snake.unshift(newHead);
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore(prev => prev + 1);
        foodRef.current = generateFood();
      } else {
        snake.pop();
      }

      draw(ctx);
      if (gameState === 'playing') animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const draw = (ctx) => {
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 400, 400);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(
      foodRef.current.x * cellSize,
      foodRef.current.y * cellSize,
      cellSize,
      cellSize
    );

    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#10B981' : '#34D399';
      ctx.fillRect(seg.x * cellSize, seg.y * cellSize, cellSize, cellSize);
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: 0 };
    nextDirectionRef.current = { x: 0, y: 0 };
    foodRef.current = generateFood();
    lastUpdateRef.current = 0;
    setIsNewRecord(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
  };

  const endGame = () => {
    setGameState('gameOver');
    const newRecord = updateHighScore('snake', score);
    setIsNewRecord(newRecord);
    if (newRecord) setHighScore(score);
  };

  const backToMenu = () => {
    setGameState('menu');
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center">
          <div className="mb-8">
            <div className="bg-[#10B981]/10 p-4 rounded-full w-20 h-20 mx-auto mb-4">
              <Gamepad2 className="w-12 h-12 text-[#10B981] mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Snake Game</h1>
            <p className="text-gray-400">
              Mueve la serpiente para comer manzanas. ¡No choques con las paredes ni contigo mismo!
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#10B981] mr-2" />
                <span className="text-white">Mejor puntuación: </span>
                <span className="text-[#10B981] font-bold ml-1">{highScore} manzanas</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8">
            <div className="bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <div className="flex items-center justify-center mb-3 space-x-2">
                <ArrowUp className="w-5 h-5 text-[#6366F1]" />
                <ArrowDown className="w-5 h-5 text-[#6366F1]" />
                <ArrowLeft className="w-5 h-5 text-[#6366F1]" />
                <ArrowRight className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div className="text-white font-medium">Controles</div>
              <div className="text-gray-400">Flechas ↑↓←→ o WASD</div>
            </div>
            <div className="bg-[#0F172A]/40 rounded-lg p-4 border border-[#334155]">
              <Target className="w-5 h-5 text-[#EF4444] mx-auto mb-3" />
              <div className="text-white font-medium">Objetivo</div>
              <div className="text-gray-400">Come 🍎 evita 💀</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
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
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Gamepad2 className="w-5 h-5 text-[#10B981] mr-2" />
              <span className="text-white font-medium">Puntuación: {score}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-5 h-5 text-[#F59E0B] mr-2" />
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

      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center max-w-md">
            <Skull className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">💀 Fin del juego</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                Puntuación final: <span className="text-[#10B981] font-bold">{score}</span>
              </p>
              {isNewRecord && (
                <p className="text-[#10B981] font-bold flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  ¡Nuevo récord!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
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

      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-2">¡Come las manzanas rojas 🍎!</h3>
          <p className="text-gray-400 text-sm">
            Usa las flechas ↑↓←→ o WASD para moverte
          </p>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="rounded-lg border-2 border-[#64748B] shadow-lg"
          />
        </div>

        <div className="text-center mt-4">
          <div className="inline-block bg-[#0F172A]/40 rounded-lg px-6 py-3 border border-[#334155]">
            <span className="text-white font-bold text-lg">
              Puntuación: <span className="text-[#10B981]">{score}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>🟩 = Serpiente | 🍎 = Comida</p>
          <p className="mt-1">Presiona cualquier flecha o WASD para comenzar a moverte</p>
        </div>
      </div>
    </div>
  );
};
