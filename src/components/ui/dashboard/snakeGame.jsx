'use client';
import React, { useEffect, useRef, useState } from 'react';

export const SnakeGame = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const directionRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const box = 20;
  const headImg = new Image();
  const bodyImg = new Image();
  headImg.src = '/snake/head.png';
  bodyImg.src = '/snake/body.png';

  const snakeRef = useRef([{ x: 9 * box, y: 10 * box }]);
  const foodRef = useRef(randomFood());

  function randomFood() {
    return {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawInitial(ctx);

    // ✅ Captura global del teclado
    const handleKeyDown = (e) => {
      e.preventDefault(); // Evita que la página se desplace
      const d = directionRef.current;

      if (gameOver) {
        if (e.key.toLowerCase() === 'r') restartGame(ctx);
        return;
      }

      if (e.key === 'ArrowLeft' && d !== 'RIGHT') directionRef.current = 'LEFT';
      else if (e.key === 'ArrowUp' && d !== 'DOWN') directionRef.current = 'UP';
      else if (e.key === 'ArrowRight' && d !== 'LEFT') directionRef.current = 'RIGHT';
      else if (e.key === 'ArrowDown' && d !== 'UP') directionRef.current = 'DOWN';

      if (!started && directionRef.current) {
        setStarted(true);
        intervalRef.current = setInterval(() => draw(ctx), 150);
      }
    };

    // ⌨️ Escucha global
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalRef.current);
    };
  }, [started, gameOver]);

  function drawInitial(ctx) {
    ctx.fillStyle = '#2a2d3e';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = 'white';
    ctx.font = '18px Poppins';
    ctx.fillText('⬆️⬇️⬅️➡️ para moverte', 95, 190);
    ctx.fillText('Presiona una tecla para comenzar', 55, 220);
  }

  function draw(ctx) {
    ctx.fillStyle = '#2a2d3e';
    ctx.fillRect(0, 0, 400, 400);

    const food = foodRef.current;
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const img = i === 0 ? headImg : bodyImg;
      if (img.complete && img.naturalWidth !== 0)
        ctx.drawImage(img, s.x, s.y, box, box);
      else {
        ctx.fillStyle = i === 0 ? '#4caf50' : '#81c784';
        ctx.fillRect(s.x, s.y, box, box);
      }
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (directionRef.current === 'LEFT') headX -= box;
    if (directionRef.current === 'UP') headY -= box;
    if (directionRef.current === 'RIGHT') headX += box;
    if (directionRef.current === 'DOWN') headY += box;

    if (headX === food.x && headY === food.y) {
      setScore((prev) => prev + 1);
      foodRef.current = randomFood();
    } else {
      snake.pop();
    }

    const newHead = { x: headX, y: headY };

    if (
      headX < 0 ||
      headX >= 400 ||
      headY < 0 ||
      headY >= 400 ||
      snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
    ) {
      endGame(ctx);
      return;
    }

    snake.unshift(newHead);
  }

  function restartGame(ctx) {
    snakeRef.current = [{ x: 9 * box, y: 10 * box }];
    directionRef.current = null;
    foodRef.current = randomFood();
    setScore(0);
    setGameOver(false);
    setStarted(false);
    clearInterval(intervalRef.current);
    drawInitial(ctx);
  }

  function endGame(ctx) {
    setGameOver(true);
    clearInterval(intervalRef.current);
    ctx.fillStyle = 'red';
    ctx.font = '26px Poppins';
    ctx.fillText('💀 Fin del juego', 105, 180);
    ctx.font = '18px Poppins';
    ctx.fillText(`Puntuación: ${score}`, 150, 210);
    ctx.fillText('Presiona R para reiniciar', 95, 240);
  }

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2>🐍 Snake</h2>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          backgroundColor: '#2a2d3e',
          border: '2px solid white',
          borderRadius: '8px',
        }}
      />
      <p>Puntuación: {score}</p>
    </div>
  );
};
