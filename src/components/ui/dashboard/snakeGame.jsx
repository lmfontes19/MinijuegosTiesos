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
    
    // Auto-scroll to game area
    setTimeout(() => {
      const gameArea = document.querySelector('[data-game-area="snake"]');
      if (gameArea) {
        gameArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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
      <div className="w-full max-w-4xl mx-auto p-2 md:p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 md:p-8 text-center">
          <div className="mb-6 md:mb-8">
            <div className="bg-[#10B981]/10 p-3 md:p-4 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-[#10B981] mx-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Snake Game</h1>
            <p className="text-gray-400 text-sm md:text-base px-2">
              Move the snake to eat apples. {"Don't crash into the walls or yourself!"}
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] mr-2" />
                <span className="text-white text-sm md:text-base">Best score: </span>
                <span className="text-[#10B981] font-bold ml-1 text-sm md:text-base">{highScore} apples</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 md:mb-8">
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center mb-3 space-x-2">
                <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
                <ArrowDown className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
              </div>
              <div className="text-white font-medium text-sm md:text-base">Controls</div>
              <div className="text-gray-400 text-xs md:text-sm">Arrows ↑↓←→ or WASD</div>
            </div>
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#EF4444] mx-auto mb-3" />
              <div className="text-white font-medium text-sm md:text-base">Objective</div>
              <div className="text-gray-400 text-xs md:text-sm">Eat apples, avoid walls</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 md:px-8 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm md:text-base"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-6">
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex items-center">
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Score: {score}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Record: {highScore}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={backToMenu}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center"
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
            <h2 className="text-2xl font-bold text-white mb-4">Game Over</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                Final score: <span className="text-[#10B981] font-bold">{score}</span>
              </p>
              {isNewRecord && (
                <p className="text-[#10B981] font-bold flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  New record!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                Play Again
              </button>
              <button
                onClick={backToMenu}
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                Menu
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Or press <kbd className="bg-[#334155] px-2 py-1 rounded text-white">R</kbd> to restart
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-3 md:p-6" data-game-area="snake">
        <div className="text-center mb-3 md:mb-4">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Eat the red apples!</h3>
          <p className="text-gray-400 text-xs md:text-sm">
            Use arrow keys ↑↓←→ or WASD to move
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[min(90vw,500px)] aspect-square">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full rounded-lg border-2 border-[#64748B] shadow-lg"
              style={{
                maxHeight: '60vh'
              }}
            />
          </div>
        </div>

        <div className="text-center mt-3 md:mt-4">
          <div className="inline-block bg-[#0F172A]/40 rounded-lg px-4 md:px-6 py-2 md:py-3 border border-[#334155]">
            <span className="text-white font-bold text-base md:text-lg">
              Score: <span className="text-[#10B981]">{score}</span>
            </span>
          </div>
        </div>

        <div className="mt-3 md:mt-4 text-center text-gray-400 text-xs md:text-sm">
          <p>■ = Snake | ● = Food</p>
          <p className="mt-1">Press any arrow key or WASD to start moving</p>
        </div>
      </div>
    </div>
  );
};
