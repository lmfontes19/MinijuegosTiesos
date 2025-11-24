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
  const [isLoading, setIsLoading] = useState(true);

  // API helper function
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('CTtoken');
    }
    return null;
  };

  // Load high scores from localStorage first, then sync with backend
  const loadHighScores = () => {
    const scores = {
      coinClick: parseInt(localStorage.getItem('coinClick_highScore')) || 0,
      flappyBird: parseInt(localStorage.getItem('flappyBird_highScore')) || 0,
      memorama: parseInt(localStorage.getItem('memorama_highScore')) || 0,
      snake: parseInt(localStorage.getItem('snake_highScore')) || 0,
      spacingLayer: parseInt(localStorage.getItem('spacingLayer_highScore')) || 0
    };
    setHighScores(scores);
    return scores;
  };

  // Load high scores from backend and update localStorage
  const loadHighScoresFromBackend = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scores/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend game names to frontend game names and update localStorage
        const mappedScores = {
          coinClick: data.coinclick || 0,
          flappyBird: data.flappybird || 0,
          memorama: data.memorama || 0,
          snake: data.snake || 0,
          spacingLayer: data.spacinglayer || 0
        };
        
        // Update localStorage with backend values
        Object.keys(mappedScores).forEach(game => {
          if (mappedScores[game] > 0) {
            localStorage.setItem(`${game}_highScore`, mappedScores[game].toString());
          }
        });
        
        setHighScores(mappedScores);
      } else {
        console.error('Failed to fetch high scores');
      }
    } catch (error) {
      console.error('Error loading high scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save score to backend
  const saveScoreToBackend = async (game, score) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available');
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scores/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game: game,
          score: score
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.newRecord || false;
      } else {
        console.error('Failed to save score');
        return false;
      }
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  };

  useEffect(() => {
    // Load from localStorage first for immediate display
    loadHighScores();
    // Then sync with backend
    loadHighScoresFromBackend();
  }, []);

  // Function to update a high score
  const updateHighScore = async (game, score) => {
    const currentScore = highScores[game] || 0;
    
    // For memorama, a lower time is better
    let isNewRecord = false;
    if (game === 'memorama') {
      isNewRecord = currentScore === 0 || score < currentScore;
    } else {
      // For other games, a higher score is better
      isNewRecord = score > currentScore;
    }
    
    // Always save the score to backend
    await saveScoreToBackend(game, score);
    
    // Update local storage and state if it's a new record locally
    if (isNewRecord) {
      localStorage.setItem(`${game}_highScore`, score.toString());
      setHighScores(prev => ({
        ...prev,
        [game]: score
      }));
      return true;
    }
    
    return false;
  };

  // Function to get the high score of a specific game
  const getHighScore = (game) => {
    return highScores[game] || 0;
  };

  // Function to refresh high scores from backend
  const refreshHighScores = () => {
    loadHighScoresFromBackend();
  };

  return {
    highScores,
    updateHighScore,
    getHighScore,
    refreshHighScores,
    isLoading
  };
};