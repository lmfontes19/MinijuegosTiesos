'use client'
import { Trophy, Gamepad2 } from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const DashboardContent = ({ highScores: propHighScores }) => {
  const { highScores: hookHighScores } = useGameHighScores();
  // Use props if provided, otherwise fallback to hook
  const highScores = propHighScores || hookHighScores;

  return (
    <div className="max-w-full overflow-hidden">
      {/* Game High Scores Section */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300 mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-[#F59E0B]" />
          Your Game High Scores
        </h3>
        {false ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F59E0B]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#6366F1]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#6366F1]" />
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">CoinClick</h4>
              <p className="text-2xl font-bold text-[#6366F1]">{highScores.coinClick.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Points</p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#10B981]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Flappy Bird</h4>
              <p className="text-2xl font-bold text-[#10B981]">{highScores.flappyBird}</p>
              <p className="text-xs text-gray-400 mt-1">Points</p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#F59E0B]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#F59E0B]" />
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Memorama</h4>
              <p className="text-2xl font-bold text-[#F59E0B]">{highScores.memorama > 0 ? `${Math.floor(highScores.memorama / 60)}:${(highScores.memorama % 60).toString().padStart(2, '0')}` : '--:--'}</p>
              <p className="text-xs text-gray-400 mt-1">Best Time</p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#EF4444]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#EF4444]" />
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Snake</h4>
              <p className="text-2xl font-bold text-[#EF4444]">{highScores.snake}</p>
              <p className="text-xs text-gray-400 mt-1">Score</p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#8B5CF6]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#8B5CF6]" />
                </div>
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Spacing Layer</h4>
              <p className="text-2xl font-bold text-[#8B5CF6]">{highScores.spacingLayer}</p>
              <p className="text-xs text-gray-400 mt-1">Level</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};