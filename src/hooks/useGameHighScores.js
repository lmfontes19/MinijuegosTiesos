// Hook to manage high scores for all mini-games
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

  // Load high scores from localStorage
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

    // Listen for changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('_highScore')) {
        loadHighScores();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for changes in the same tab
    const handleHighScoreUpdate = () => {
      loadHighScores();
    };

    window.addEventListener('highScoreUpdated', handleHighScoreUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('highScoreUpdated', handleHighScoreUpdate);
    };
  }, []);

  // Function to update a high score
  const updateHighScore = (game, score) => {
    const currentScore = highScores[game] || 0;
    
    // For memorama, a lower time is better
    let isNewRecord = false;
    if (game === 'memorama') {
      isNewRecord = currentScore === 0 || score < currentScore;
    } else {
      // For other games, a higher score is better
      isNewRecord = score > currentScore;
    }
    
    if (isNewRecord) {
      localStorage.setItem(`${game}_highScore`, score.toString());
      setHighScores(prev => ({
        ...prev,
        [game]: score
      }));
      
      // Trigger custom event to notify the change
      window.dispatchEvent(new CustomEvent('highScoreUpdated', {
        detail: { game, score, isNewRecord: true }
      }));
      
      return true;
    }
    
    return false;
  };

  // Function to get the high score of a specific game
  const getHighScore = (game) => {
    return highScores[game] || 0;
  };

  // Function to reset all high scores
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

  // Function to export high scores data
  const exportHighScores = () => {
    return JSON.stringify(highScores, null, 2);
  };

  // Function to import high scores data
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