// Hook para manejar high scores de todos los minijuegos
'use client'
import { useState, useEffect } from 'react';

export const useGameHighScores = () => {
  const [highScores, setHighScores] = useState({
    coinClick: 0,
    flappyBird: 0,
    memorama: 0,
    snake: 0,
    spacingLayer: 0
  });

  // Cargar high scores del localStorage
  useEffect(() => {
    const loadHighScores = () => {
      const scores = {
        coinClick: parseInt(localStorage.getItem('coinClick_highScore')) || 0,
        flappyBird: parseInt(localStorage.getItem('flappyBird_highScore')) || 0,
        memorama: parseInt(localStorage.getItem('memorama_highScore')) || 0,
        snake: parseInt(localStorage.getItem('snake_highScore')) || 0,
        spacingLayer: parseInt(localStorage.getItem('spacingLayer_highScore')) || 0
      };
      setHighScores(scores);
    };

    loadHighScores();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('_highScore')) {
        loadHighScores();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleHighScoreUpdate = () => {
      loadHighScores();
    };

    window.addEventListener('highScoreUpdated', handleHighScoreUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('highScoreUpdated', handleHighScoreUpdate);
    };
  }, []);

  // Función para actualizar un high score
  const updateHighScore = (game, score) => {
    const currentScore = highScores[game] || 0;
    
    // Para memorama, un menor tiempo es mejor
    let isNewRecord = false;
    if (game === 'memorama') {
      isNewRecord = currentScore === 0 || score < currentScore;
    } else {
      // Para otros juegos, un mayor puntaje es mejor
      isNewRecord = score > currentScore;
    }
    
    if (isNewRecord) {
      localStorage.setItem(`${game}_highScore`, score.toString());
      setHighScores(prev => ({
        ...prev,
        [game]: score
      }));
      
      // Disparar evento personalizado para notificar el cambio
      window.dispatchEvent(new CustomEvent('highScoreUpdated', {
        detail: { game, score, isNewRecord: true }
      }));
      
      return true;
    }
    
    return false;
  };

  // Función para obtener el high score de un juego específico
  const getHighScore = (game) => {
    return highScores[game] || 0;
  };

  // Función para resetear todos los high scores
  const resetAllHighScores = () => {
    Object.keys(highScores).forEach(game => {
      localStorage.removeItem(`${game}_highScore`);
    });
    setHighScores({
      coinClick: 0,
      flappyBird: 0,
      memorama: 0,
      snake: 0,
      spacingLayer: 0
    });
    window.dispatchEvent(new CustomEvent('highScoreUpdated'));
  };

  // Función para exportar datos de high scores
  const exportHighScores = () => {
    return JSON.stringify(highScores, null, 2);
  };

  // Función para importar datos de high scores
  const importHighScores = (scoresData) => {
    try {
      const scores = JSON.parse(scoresData);
      Object.keys(scores).forEach(game => {
        if (highScores.hasOwnProperty(game)) {
          localStorage.setItem(`${game}_highScore`, scores[game].toString());
        }
      });
      setHighScores(scores);
      window.dispatchEvent(new CustomEvent('highScoreUpdated'));
      return true;
    } catch (error) {
      console.error('Error importing high scores:', error);
      return false;
    }
  };

  return {
    highScores,
    updateHighScore,
    getHighScore,
    resetAllHighScores,
    exportHighScores,
    importHighScores
  };
};