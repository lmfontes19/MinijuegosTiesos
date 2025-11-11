'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Trophy, Star, Gamepad2, Target, Skull,
  ArrowLeft, ArrowRight, Zap, Rocket
} from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const SpacingLayerGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 30;
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 8;
  const ENEMY_SPEED = 1;
  const ENEMY_DROP_SPEED = 20;
  const ENEMY_WIDTH = 30;
  const ENEMY_HEIGHT = 20;
  const ENEMY_BULLET_SPEED = 4;

  // Game refs
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  });
  
  const bulletsRef = useRef([]);
  const enemyBulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const explosionsRef = useRef([]);
  const keysRef = useRef({});
  const frameCountRef = useRef(0);
  const enemyDirectionRef = useRef(1);
  const lastEnemyBulletRef = useRef(0);
  const lastPlayerShotRef = useRef(0);
  const playerHitTimeRef = useRef(0);

  useEffect(() => {
    const currentHighScore = getHighScore('spacingLayer');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  // Monitor lives for game over
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      console.log(`Game over triggered with lives: ${lives}`); // Debug log
      endGame();
    }
  }, [lives, gameState]);

  // Controls
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowleft', 'arrowright', ' ', 'a', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      // Only shoot once per keydown for space, continuous shooting is handled in updateGame
      if (e.key === ' ' && !keysRef.current['space_was_pressed']) {
        keysRef.current['space_was_pressed'] = true;
        shoot();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
      if (e.key === ' ') {
        keysRef.current['space_was_pressed'] = false;
      }
    };

    // Touch controls for mobile
    const handleTouchStart = (e) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      
      Array.from(e.touches).forEach(touch => {
        const touchX = (touch.clientX - rect.left) * scaleX;
        const touchY = (touch.clientY - rect.top) * scaleY;
        
        // If touching upper part of canvas, shoot
        if (touchY < CANVAS_HEIGHT * 0.8) {
          shoot();
        } else {
          // If touching lower part, move player towards touch
          const player = playerRef.current;
          if (touchX < player.x + player.width / 2) {
            keysRef.current['arrowleft'] = true;
            keysRef.current['arrowright'] = false;
          } else {
            keysRef.current['arrowright'] = true;
            keysRef.current['arrowleft'] = false;
          }
        }
      });
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      keysRef.current['arrowleft'] = false;
      keysRef.current['arrowright'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
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

  const createEnemyGrid = (level) => {
    const enemies = [];
    const rows = Math.min(5, 2 + Math.floor(level / 2));
    const cols = 10;
    const startX = 50;
    const startY = 50;
    const spacingX = 60;
    const spacingY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: startX + col * spacingX,
          y: startY + row * spacingY,
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          type: row < 1 ? 'fast' : row < 3 ? 'medium' : 'slow',
          points: row < 1 ? 30 : row < 3 ? 20 : 10
        });
      }
    }
    return enemies;
  };

  const shoot = () => {
    // Limit shooting rate to prevent spam - increased from 15 to 20 for slower shooting
    if (frameCountRef.current - lastPlayerShotRef.current < 20) return;
    
    const player = playerRef.current;
    bulletsRef.current.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10
    });
    lastPlayerShotRef.current = frameCountRef.current;
  };

  const enemyShoot = () => {
    if (frameCountRef.current - lastEnemyBulletRef.current < 60) return; // Reducido de 120 a 60
    
    const bottomEnemies = enemiesRef.current.filter(enemy => {
      return !enemiesRef.current.some(otherEnemy => 
        otherEnemy.x === enemy.x && otherEnemy.y > enemy.y
      );
    });

    if (bottomEnemies.length > 0) {
      // En niveles más altos, pueden disparar múltiples enemigos a la vez
      const shotsCount = Math.min(3, Math.floor(level / 2) + 1);
      
      for (let i = 0; i < shotsCount && i < bottomEnemies.length; i++) {
        const randomEnemy = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];
        enemyBulletsRef.current.push({
          x: randomEnemy.x + randomEnemy.width / 2 - 2,
          y: randomEnemy.y + randomEnemy.height,
          width: 4,
          height: 10
        });
      }
      
      lastEnemyBulletRef.current = frameCountRef.current;
    }
  };

  const checkCollisions = () => {
    // Check bullet-enemy collisions
    for (let bulletIndex = bulletsRef.current.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = bulletsRef.current[bulletIndex];
      for (let enemyIndex = enemiesRef.current.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemiesRef.current[enemyIndex];
        if (bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          // Create explosion effect
          explosionsRef.current.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            life: 20,
            maxLife: 20
          });
          
          setScore(prev => prev + enemy.points);
          bulletsRef.current.splice(bulletIndex, 1);
          enemiesRef.current.splice(enemyIndex, 1);
          break; // Exit enemy loop since bullet is destroyed
        }
      }
    }

    // Check enemy bullet-player collisions
    const player = playerRef.current;
    for (let bulletIndex = enemyBulletsRef.current.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = enemyBulletsRef.current[bulletIndex];
      if (bullet.x < player.x + player.width &&
          bullet.x + bullet.width > player.x &&
          bullet.y < player.y + player.height &&
          bullet.y + bullet.height > player.y) {
        
        enemyBulletsRef.current.splice(bulletIndex, 1);
        playerHitTimeRef.current = frameCountRef.current; // Record hit time for visual effect
        setLives(prev => {
          const newLives = prev - 1;
          console.log(`Player hit! Lives: ${prev} -> ${newLives}`); // Debug log
          return newLives;
        });
        
        // Create explosion effect on player
        explosionsRef.current.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          life: 30,
          maxLife: 30
        });
      }
    }

    // Check enemy-player collisions
    enemiesRef.current.forEach(enemy => {
      if (enemy.x < player.x + player.width &&
          enemy.x + enemy.width > player.x &&
          enemy.y < player.y + player.height &&
          enemy.y + enemy.height > player.y) {
        
        playerHitTimeRef.current = frameCountRef.current; // Record hit time for visual effect
        setLives(prev => {
          const newLives = prev - 1;
          console.log(`Player collision with enemy! Lives: ${prev} -> ${newLives}`); // Debug log
          return newLives;
        });
      }
    });

    // Check if enemies reached bottom
    enemiesRef.current.forEach(enemy => {
      if (enemy.y + enemy.height >= CANVAS_HEIGHT - 80) {
        setLives(0);
        console.log("Enemy reached bottom! Game over."); // Debug log
      }
    });
  };

  const updateGame = () => {
    frameCountRef.current++;
    
    const player = playerRef.current;
    
    // Move player
    if (keysRef.current['arrowleft'] || keysRef.current['a']) {
      player.x = Math.max(0, player.x - PLAYER_SPEED);
    }
    if (keysRef.current['arrowright'] || keysRef.current['d']) {
      player.x = Math.min(CANVAS_WIDTH - player.width, player.x + PLAYER_SPEED);
    }

    // Continuous shooting while space is held
    if (keysRef.current[' ']) {
      shoot();
    }

    // Move bullets
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.y -= BULLET_SPEED;
      return bullet.y > -bullet.height;
    });

    // Move enemy bullets
    enemyBulletsRef.current = enemyBulletsRef.current.filter(bullet => {
      bullet.y += ENEMY_BULLET_SPEED;
      return bullet.y < CANVAS_HEIGHT;
    });

    // Move enemies
    let shouldDropDown = false;
    let edgeHit = false;
    
    enemiesRef.current.forEach(enemy => {
      if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
        edgeHit = true;
      }
    });

    if (edgeHit) {
      enemyDirectionRef.current *= -1;
      enemiesRef.current.forEach(enemy => {
        enemy.y += ENEMY_DROP_SPEED;
        enemy.x += ENEMY_SPEED * enemyDirectionRef.current;
      });
    } else {
      enemiesRef.current.forEach(enemy => {
        enemy.x += ENEMY_SPEED * enemyDirectionRef.current * (1 + level * 0.1);
      });
    }

    // Enemy shooting (adjust frequency based on level) - más frecuente y escalable
    if (frameCountRef.current % Math.max(30, 80 - level * 8) === 0) {
      enemyShoot();
    }

    // Update explosions
    explosionsRef.current = explosionsRef.current.filter(explosion => {
      explosion.life--;
      return explosion.life > 0;
    });

    // Check collisions
    checkCollisions();

    // Check level completion
    if (enemiesRef.current.length === 0) {
      nextLevel();
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    enemiesRef.current = createEnemyGrid(level + 1);
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    explosionsRef.current = [];
    playerRef.current.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    enemyDirectionRef.current = 1;
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsNewRecord(false);
    
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };
    
    enemiesRef.current = createEnemyGrid(1);
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    explosionsRef.current = [];
    frameCountRef.current = 0;
    enemyDirectionRef.current = 1;
    lastEnemyBulletRef.current = 0;
    lastPlayerShotRef.current = 0;
    playerHitTimeRef.current = 0;
    keysRef.current = {};
  };

  const endGame = () => {
    setGameState('gameOver');
    const newRecord = updateHighScore('spacingLayer', level);
    setIsNewRecord(newRecord);
    if (newRecord) setHighScore(level);
  };

  const backToMenu = () => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const gameLoop = () => {
    if (gameState !== 'playing') return;

    updateGame();
    draw();

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

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

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5 + frameCountRef.current * 0.5) % CANVAS_WIDTH;
      const y = (i * 43.7) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    const player = playerRef.current;
    const isRecentlyHit = frameCountRef.current - playerHitTimeRef.current < 30;
    const shouldFlash = isRecentlyHit && Math.floor(frameCountRef.current / 5) % 2 === 0;
    
    if (!shouldFlash) {
      ctx.fillStyle = '#10B981';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      // Player details
      ctx.fillStyle = '#34D399';
      ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(player.x + 20, player.y - 5, 10, 8);
    }

    // Draw enemies
    enemiesRef.current.forEach(enemy => {
      if (enemy.type === 'fast') {
        ctx.fillStyle = '#EF4444';
      } else if (enemy.type === 'medium') {
        ctx.fillStyle = '#F59E0B';
      } else {
        ctx.fillStyle = '#8B5CF6';
      }
      
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Enemy details
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
      ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
    });

    // Draw bullets
    ctx.fillStyle = '#06D6A0';
    bulletsRef.current.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemy bullets
    ctx.fillStyle = '#EF4444';
    enemyBulletsRef.current.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw explosions
    explosionsRef.current.forEach(explosion => {
      const alpha = explosion.life / explosion.maxLife;
      const size = (1 - alpha) * 20 + 5;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFD23F';
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-3 md:p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6 md:p-8 text-center">
          <div className="mb-6 md:mb-8">
            <div className="bg-[#8B5CF6]/10 p-3 md:p-4 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Rocket className="w-10 h-10 md:w-12 md:h-12 text-[#8B5CF6] mx-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Spacing Layer</h1>
            <p className="text-gray-400 text-sm md:text-base">
              ¡Defiende la Tierra de la invasión alienígena! Dispara y sobrevive a las oleadas.
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6] mr-2" />
                <span className="text-white text-sm md:text-base">Mejor nivel alcanzado: </span>
                <span className="text-[#8B5CF6] font-bold ml-1 text-sm md:text-base">{highScore}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm mb-6 md:mb-8">
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center mb-3 space-x-2">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1]" />
              </div>
              <div className="text-white font-medium text-sm">Mover</div>
              <div className="text-gray-400 text-xs md:text-sm">Flechas ←→ o A/D</div>
              <div className="text-gray-400 text-xs mt-1">📱 Touch: Toca los lados</div>
            </div>
            
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] mx-auto mb-3" />
              <div className="text-white font-medium text-sm">Disparar</div>
              <div className="text-gray-400 text-xs md:text-sm">Barra espaciadora (mantén presionado)</div>
              <div className="text-gray-400 text-xs mt-1">📱 Touch: Toca arriba</div>
            </div>
            
            <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#EF4444] mx-auto mb-3" />
              <div className="text-white font-medium text-sm">Objetivo</div>
              <div className="text-gray-400 text-xs md:text-sm">Elimina todos los aliens</div>
            </div>
          </div>

          <div className="bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155] mb-6 md:mb-8">
            <h3 className="text-white font-medium mb-2 text-sm md:text-base">👾 Enemigos y Puntuación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="text-gray-400">
                <span className="text-[#EF4444]">■</span> Rápidos: 30 pts
              </div>
              <div className="text-gray-400">
                <span className="text-[#F59E0B]">■</span> Medios: 20 pts
              </div>
              <div className="text-gray-400">
                <span className="text-[#8B5CF6]">■</span> Lentos: 10 pts
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm md:text-base"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Comenzar Misión
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
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Nivel: {level}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Puntuación: {score}</span>
            </div>
            <div className="flex items-center">
              <span className="text-white font-medium text-sm md:text-base">Vidas: {'❤️'.repeat(Math.max(0, lives))}</span>
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#EF4444] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Enemigos: {enemiesRef.current.length}</span>
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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">🚀 Misión Terminada</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300 text-sm md:text-base">
                Nivel alcanzado: <span className="text-[#8B5CF6] font-bold">{level}</span>
              </p>
              <p className="text-gray-300 text-sm md:text-base">
                Puntuación final: <span className="text-[#10B981] font-bold">{score}</span>
              </p>
              {isNewRecord && (
                <p className="text-[#8B5CF6] font-bold flex items-center justify-center text-sm md:text-base">
                  <Star className="w-4 h-4 mr-1" />
                  ¡Nuevo récord de nivel!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex-1 text-sm md:text-base"
              >
                Nueva Misión
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
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">🚀 Defiende la Tierra</h3>
          <p className="text-gray-400 text-xs md:text-sm">
            <span className="hidden md:inline">Muévete con </span>
            <kbd className="bg-[#334155] px-1 md:px-2 py-1 rounded text-white mx-1">←→</kbd> 
            <span className="hidden md:inline"> o </span>
            <kbd className="bg-[#334155] px-1 md:px-2 py-1 rounded text-white mx-1">A/D</kbd>, 
            <span className="hidden md:inline"> mantén </span>
            <kbd className="bg-[#334155] px-1 md:px-2 py-1 rounded text-white mx-1">Espacio</kbd>
            <span className="hidden md:inline"> para disparar</span>
          </p>
          <p className="text-gray-400 text-xs mt-1 md:hidden">
            📱 Toca los lados para moverte, toca arriba para disparar
          </p>
        </div>

        <div className="flex justify-center overflow-hidden">
          <div className="relative w-full max-w-[800px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-lg border-2 border-[#64748B] shadow-lg w-full h-auto"
              style={{ 
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
                maxHeight: '70vh'
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-center text-gray-400 text-xs md:text-sm">
          <p>🟢 = Tu nave | 👾 = Enemigos | 🟢• = Tus disparos | 🔴• = Disparos enemigos</p>
          <p className="mt-1 hidden md:block">¡Elimina todos los alienígenas para pasar al siguiente nivel!</p>
          <p className="mt-1 md:hidden">📱 Toca para jugar - ¡Elimina todos los aliens!</p>
        </div>
      </div>
    </div>
  );
};