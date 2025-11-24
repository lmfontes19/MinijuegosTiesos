'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, RotateCcw, Trophy, Target, Skull, Coins
} from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const CoinClickGame = () => {
  const { updateHighScore, getHighScore } = useGameHighScores();
  const animationRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const objectIdRef = useRef(0);
  
  // Game states
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  
  // Game objects
  const [character, setCharacter] = useState({ x: 50, y: 5 });
  const [objects, setObjects] = useState([]);

  // Load high score
  useEffect(() => {
    const currentHighScore = getHighScore('coinClick');
    setHighScore(currentHighScore);
  }, [getHighScore]);

  // End game function
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (score > highScore) {
      setIsNewRecord(true);
      updateHighScore('coinclick', score).then((wasNewRecord) => {
        if (wasNewRecord) {
          setHighScore(score);
        }
      });
    }
  }, [score, highScore, updateHighScore]);

  // Handle object clicks
  const handleObjectClick = useCallback((objectId, objectType) => {
    if (gameState !== 'playing') return;
    
    if (objectType === 'coin') {
      setScore(prev => prev + 1);
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
    } else if (objectType === 'bomb') {
      endGame();
    }
  }, [gameState, endGame]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setGameSpeed(1);
    setCharacter({ x: 50, y: 5 });
    setObjects([]);
    lastSpawnRef.current = 0;
    objectIdRef.current = 0;
    setIsNewRecord(false);
    
    // Auto-scroll to game area
    setTimeout(() => {
      const gameArea = document.querySelector('[data-game-area="coinclick"]');
      if (gameArea) {
        gameArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  const backToMenu = useCallback(() => {
    setGameState('menu');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Handle restart with R key
  useEffect(() => {
    if (gameState !== 'gameOver') return;
    const handleRestart = (e) => {
      if (e.key.toLowerCase() === 'r') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleRestart);
    return () => window.removeEventListener('keydown', handleRestart);
  }, [gameState, startGame]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const gameLoop = (currentTime) => {
      const currentGameSpeed = 1 + Math.floor(score / 5) * 0.3;
      setGameSpeed(currentGameSpeed);
      
      const time = currentTime / (1500 / currentGameSpeed);
      const newCharacterX = 50 + Math.sin(time) * 35;
      const clampedCharacterX = Math.max(10, Math.min(90, newCharacterX));
      
      setCharacter(prev => ({ ...prev, x: clampedCharacterX }));

      const spawnInterval = Math.max(800, 2000 - (currentGameSpeed - 1) * 200);
      if (currentTime - lastSpawnRef.current > spawnInterval) {
        const isCoin = Math.random() < 0.7;
        const baseSpeed = 0.8 + (currentGameSpeed - 1) * 0.4;
        const newObject = {
          id: `obj_${objectIdRef.current++}`,
          x: clampedCharacterX, // Objects spawn exactly from character position
          y: 8, // Just below the character
          type: isCoin ? 'coin' : 'bomb',
          speed: baseSpeed + Math.random() * 0.3
        };
        setObjects(prev => [...prev, newObject]);
        lastSpawnRef.current = currentTime;
      }

      setObjects(prev => {
        return prev.map(obj => ({
          ...obj,
          y: obj.y + obj.speed * currentGameSpeed
        })).filter(obj => {
          if (obj.y > 100) {
            if (obj.type === 'coin') {
              endGame();
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
  }, [gameState, score, endGame]);

  if (gameState === 'menu') {
    return (
      <div className="w-full max-w-4xl mx-auto p-2 md:p-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 md:p-8 text-center">
          <div className="mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Coins className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">CoinClick</h1>
            <p className="text-gray-400 text-sm md:text-base px-2">
              Click on falling coins to collect them and avoid bombs!<br/>
              <span className="text-sm text-[#F59E0B]">{"Speed increases every 5 coins! Don't let coins fall off!"}</span>
            </p>
          </div>
          {highScore > 0 && (
            <div className="mb-6 bg-[#0F172A]/40 rounded-lg p-3 md:p-4 border border-[#334155]">
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#F59E0B] mr-2" />
                <span className="text-white text-sm md:text-base">Best Score: </span>
                <span className="text-[#F59E0B] font-bold ml-1 text-sm md:text-base">{highScore} coins</span>
              </div>
            </div>
          )}
          <button
            onClick={startGame}
            className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-6 md:px-8 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto text-sm md:text-base"
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
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-[#F59E0B] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Coins: {score}</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Best: {highScore}</span>
            </div>
            {gameState === 'playing' && (
              <div className="flex items-center">
                <div className="w-4 h-4 md:w-5 md:h-5 text-[#6366F1] mr-2">⚡</div>
                <span className="text-white font-medium text-sm md:text-base">Speed: {gameSpeed.toFixed(1)}x</span>
              </div>
            )}
          </div>
          <button onClick={backToMenu} className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white px-3 md:px-4 py-2 rounded-lg transition-colors self-start lg:self-auto">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {gameState === 'gameOver' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-8 text-center max-w-md">
            <Skull className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Game Over!</h2>
            <div className="space-y-2 mb-6">
              <div className="text-gray-400">Final Score</div>
              <div className="text-3xl font-bold text-[#F59E0B]">{score} coins</div>
              {isNewRecord && <div className="text-[#10B981] font-medium">New Record!</div>}
            </div>
            <div className="flex gap-3">
              <button onClick={startGame} className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1">
                Play Again
              </button>
              <button onClick={backToMenu} className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1">
                Menu
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Or press <kbd className="bg-[#334155] px-2 py-1 rounded text-white">R</kbd> to restart
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-3 md:p-6" data-game-area="coinclick">
        <div className="text-center mb-3 md:mb-4">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Click the coins and avoid the bombs!</h3>
          <p className="text-gray-400 text-xs md:text-sm">All coins = 1 point • Speed increases every 5 coins • {"Don't let coins fall!"}</p>
        </div>
        
        <div className="w-full max-w-5xl mx-auto">
          <div 
            className="relative bg-gradient-to-b from-[#475569] via-[#334155] to-[#1E293B] rounded-lg border-2 border-[#64748B] overflow-hidden shadow-inner w-full" 
            style={{ 
              height: 'clamp(350px, 55vh, 550px)',
              backgroundImage: 'url(/coinclicker/background.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background overlay to maintain game visibility */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div
              className="absolute z-30"
              style={{
                left: `${character.x}%`,
                top: `${character.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#8B4513] to-[#654321] rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-[#A0522D] shadow-xl">
              </div>
            </div>

            {objects.map(obj => (
              <div
                key={obj.id}
                className="absolute z-40 cursor-pointer hover:scale-110 transition-transform duration-100"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleObjectClick(obj.id, obj.type)}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl shadow-xl border-2 ${
                  obj.type === 'coin' 
                    ? 'bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] border-[#FBBF24] hover:from-[#FEF08A] hover:to-[#FCD34D]' 
                    : 'bg-gradient-to-br from-[#1F2937] to-[#111827] border-[#374151] hover:from-[#374151] hover:to-[#1F2937]'
                }`}>
                  {obj.type === 'coin' ? '$' : 'X'}
                </div>
              </div>
            ))}

            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs md:text-sm bg-black/50 px-2 md:px-3 py-1 rounded-lg">
                Click on coins before they fall off the screen!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CoinClickGame;
