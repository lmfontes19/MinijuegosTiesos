'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Trophy, Star, Gamepad2, Target, Skull, 
  Space
} from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const FlappyBirdGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [hasStarted, setHasStarted] = useState(true); // Para controlar si ha empezado la física

  // Game constants
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 220;
  const GRAVITY = 0.4; // Incrementado para mejor jugabilidad
  const JUMP_STRENGTH = -9; // Incrementado para mejor balance
  const INITIAL_PIPE_SPEED = 3; // Velocidad original
  const SPEED_INCREASE = 0.5;
  const PIPES_PER_LEVEL = 5; // Corregido a 5

  // Game refs
  const birdRef = useRef({
    x: 100,
    y: CANVAS_HEIGHT / 2,
    velocity: 0,
    rotation: 0
  });
  const pipesRef = useRef([]);
  const frameRef = useRef(0);
  const currentSpeedRef = useRef(INITIAL_PIPE_SPEED);

  useEffect(() => {
    const currentHighScore = getHighScore('flappyBird');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  // Controls
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleInput = (e) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    const handleCanvasClick = (e) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', handleInput);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
    }

    return () => {
      window.removeEventListener('keydown', handleInput);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [gameState]);

  // Restart on R key during game over
  useEffect(() => {
    if (gameState !== 'gameOver') return;
    
    const handleRestart = (e) => {
      if (e.key.toLowerCase() === 'r') startGame();
    };
    
    window.addEventListener('keydown', handleRestart);
    return () => window.removeEventListener('keydown', handleRestart);
  }, [gameState]);

  const jump = () => {
    if (gameState === 'playing') {
      // Si es el primer click, iniciar la física del juego
      if (!hasStarted) {
        setHasStarted(true);
      }
      birdRef.current.velocity = JUMP_STRENGTH;
    }
  };

  const generatePipes = () => {
    const gapPosition = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
    return {
      x: CANVAS_WIDTH,
      topHeight: gapPosition,
      bottomY: gapPosition + PIPE_GAP,
      passed: false
    };
  };

  const resetGame = () => {
    birdRef.current = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      velocity: 0,
      rotation: 0
    };
    pipesRef.current = [];
    frameRef.current = 0;
    currentSpeedRef.current = INITIAL_PIPE_SPEED;
    setScore(0);
    setIsNewRecord(false);
    setHasStarted(true); // Resetear el estado para esperar el primer click
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('gameOver');
    const newRecord = updateHighScore('flappyBird', score);
    setIsNewRecord(newRecord);
    if (newRecord) setHighScore(score);
  };

  const backToMenu = () => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const gameLoop = () => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    frameRef.current++;

    // Solo aplicar física si ya ha empezado (después del primer click)
    if (hasStarted) {
      // Update bird physics
      const bird = birdRef.current;
      bird.velocity += GRAVITY;
      bird.y += bird.velocity;
      bird.rotation = Math.min(bird.velocity * 3, 90);

      // Check ground and ceiling collision
      if (bird.y + BIRD_SIZE > CANVAS_HEIGHT - 50 || bird.y < 0) {
        endGame();
        return;
      }

      // Calculate current speed based on score
      currentSpeedRef.current = INITIAL_PIPE_SPEED + Math.floor(score / PIPES_PER_LEVEL) * SPEED_INCREASE;

      // Update pipes with dynamic speed
      pipesRef.current = pipesRef.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);
      
      pipesRef.current.forEach(pipe => {
        pipe.x -= currentSpeedRef.current;

        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdRef.current.x) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }

        // Check collision with pipes
        if (
          birdRef.current.x + BIRD_SIZE > pipe.x &&
          birdRef.current.x < pipe.x + PIPE_WIDTH &&
          (birdRef.current.y < pipe.topHeight || birdRef.current.y + BIRD_SIZE > pipe.bottomY)
        ) {
          endGame();
          return;
        }
      });

      // Generate new pipes - primera tubería aparece después de 180 frames (~3 segundos)
      // Después aparecen cada 150 frames
      const pipeSpawnInterval = pipesRef.current.length === 0 ? 180 : 150;
      if (frameRef.current % pipeSpawnInterval === 0) {
        pipesRef.current.push(generatePipes());
      }
    }

    // Siempre dibujar, independientemente de si ha empezado
    draw(ctx);

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Game loop effect
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const draw = (ctx) => {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
      const x = (frameRef.current * 0.5 + i * 150) % (CANVAS_WIDTH + 100);
      drawCloud(ctx, x, 80 + i * 40);
    }

    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipesRef.current.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Pipe cap
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, CANVAS_HEIGHT - pipe.bottomY);
      // Pipe cap
      ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 20);
    });

    // Draw bird
    const bird = birdRef.current;
    ctx.save();
    ctx.translate(bird.x + BIRD_SIZE/2, bird.y + BIRD_SIZE/2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-BIRD_SIZE/2, -BIRD_SIZE/2, BIRD_SIZE, BIRD_SIZE);
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(-BIRD_SIZE/3, -BIRD_SIZE/3, BIRD_SIZE/2, BIRD_SIZE/3);
    
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(BIRD_SIZE/4, -BIRD_SIZE/4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE/2, 0);
    ctx.lineTo(BIRD_SIZE/2 + 10, 0);
    ctx.lineTo(BIRD_SIZE/2, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, CANVAS_HEIGHT - 55, CANVAS_WIDTH, 10);

    // Si no ha empezado, mostrar mensaje de "haz click para empezar"
    if (!hasStarted) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'; // Semi-transparent gold
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      
      // Draw text with stroke for better visibility
      ctx.strokeText('🐦 Haz click para empezar 🐦', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.fillText('🐦 Haz click para empezar 🐦', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = '14px Arial';
      ctx.strokeText('Presiona ESPACIO o haz click', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      ctx.fillText('Presiona ESPACIO o haz click', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
    }
  };

  const drawCloud = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-3 md:p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6 md:p-8 text-center">
          <div className="mb-6 md:mb-8">
            <div className="bg-[#FFD700]/10 p-3 md:p-4 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-[#FFD700] mx-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Flappy Bird</h1>
            <p className="text-gray-400 text-sm md:text-base">
              ¡Ayuda al pajarito a volar entre las tuberías sin chocar!
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700] mr-2" />
                <span className="text-white text-sm md:text-base">Mejor puntuación: </span>
                <span className="text-[#FFD700] font-bold ml-1 text-sm md:text-base">{highScore} puntos</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm mb-6 md:mb-8">
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center mb-3 space-x-2">
                <Space className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
                <span className="text-[#6366F1] text-xs md:text-sm">CLICK</span>
              </div>
              <div className="text-white font-medium text-sm">Controles</div>
              <div className="text-gray-400 text-xs md:text-sm">
                <span className="text-[#FFD700]">1.</span> Click para empezar<br/>
                <span className="text-[#FFD700]">2.</span> Espaciadora/Click para saltar
              </div>
            </div>
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] mx-auto mb-3" />
              <div className="text-white font-medium text-sm">Objetivo</div>
              <div className="text-gray-400 text-xs md:text-sm">Pasa entre las tuberías 🟢</div>
            </div>
          </div>

          <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155] mb-6 md:mb-8">
            <h3 className="text-white font-medium mb-2 text-sm md:text-base">🚀 Sistema de Velocidad</h3>
            <p className="text-gray-400 text-xs md:text-sm">
              El juego se acelera cada <span className="text-[#FFD700]">{PIPES_PER_LEVEL} tuberías</span> superadas
            </p>
          </div>

          <button
            onClick={startGame}
            className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm md:text-base"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Comenzar Juego
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6">
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center space-x-3 md:space-x-6">
            <div className="flex items-center">
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Puntuación: {score}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Récord: {highScore}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={backToMenu}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6 md:p-8 text-center max-w-md w-full">
            <Skull className="w-12 h-12 md:w-16 md:h-16 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">💥 ¡Chocaste!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300 text-sm md:text-base">
                Puntuación final: <span className="text-[#FFD700] font-bold">{score}</span>
              </p>
              <p className="text-gray-400 text-xs md:text-sm">
                Nivel alcanzado: {Math.floor(score / PIPES_PER_LEVEL) + 1}
              </p>
              {isNewRecord && (
                <p className="text-[#FFD700] font-bold flex items-center justify-center text-sm md:text-base">
                  <Star className="w-4 h-4 mr-1" />
                  ¡Nuevo récord!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex-1 text-sm md:text-base"
              >
                Jugar de nuevo
              </button>
              <button
                onClick={backToMenu}
                className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex-1 text-sm md:text-base"
              >
                Menú
              </button>
            </div>
            <p className="text-gray-400 text-xs md:text-sm mt-4">
              O presiona <kbd className="bg-[#334155] px-2 py-1 rounded text-white">R</kbd> para reiniciar
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-3 md:p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">🐦 ¡Vuela entre las tuberías!</h3>
          <p className="text-gray-400 text-xs md:text-sm">
            Presiona <kbd className="bg-[#334155] px-1 md:px-2 py-1 rounded text-white mx-1">Espacio</kbd> 
            o <span className="text-[#6366F1] font-medium">haz click</span> para saltar
          </p>
        </div>

        <div className="text-center mb-4">
          <div className="inline-block bg-[#0F172A]/40 rounded-lg px-4 md:px-6 py-2 md:py-3 border border-[#334155]">
            <span className="text-white font-bold text-sm md:text-lg">
              Puntuación: <span className="text-[#FFD700]">{score}</span>
            </span>
            {score > 0 && (
              <span className="ml-4 text-xs md:text-sm text-gray-400">
                Velocidad: {Math.floor(score / PIPES_PER_LEVEL) + 1}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center overflow-hidden">
          <div className="relative w-full max-w-[480px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-lg border-2 border-[#64748B] shadow-lg cursor-pointer w-full h-auto"
              style={{ 
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
                maxHeight: '80vh'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};