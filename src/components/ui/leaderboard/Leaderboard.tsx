'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUpRight } from 'lucide-react';

interface LeaderboardProps {
    isDashboard?: boolean;
    currentUserId?: number;
}

interface LeaderboardData {
    rank: number;
    userId: number;
    username: string;
    score: number;
    isCurrentUser?: boolean;
}

interface Prize {
    rank: number | string;
    amount: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isDashboard = false, currentUserId }) => {
    const [activeLeaderboardType, setActiveLeaderboardType] = useState('snake');
    const [isLoading, setIsLoading] = useState(true);
    const [snakeData, setSnakeData] = useState<LeaderboardData[]>([]);
    const [memoramaData, setMemoramaData] = useState<LeaderboardData[]>([]);
    const [coinClickData, setCoinClickData] = useState<LeaderboardData[]>([]);
    const [flappyBirdData, setFlappyBirdData] = useState<LeaderboardData[]>([]);
    const [spacingLayerData, setSpacingLayerData] = useState<LeaderboardData[]>([]);

    const leaderboardTypes = [
        { id: 'snake', name: 'Snake', icon: Trophy, color: '#10B981' },
        { id: 'memorama', name: 'Memorama', icon: Trophy, color: '#6366F1' },
        { id: 'coinClick', name: 'CoinClick', icon: Trophy, color: '#F59E0B' },
        { id: 'flappyBird', name: 'Flappy Bird', icon: Trophy, color: '#EC4899' },
        { id: 'spacingLayer', name: 'Spacing Layer', icon: Trophy, color: '#8B5CF6' }
    ];

    const prizes = {
        snake: [
            { rank: 1, amount: "$20" },
            { rank: 2, amount: "$10" },
            { rank: 3, amount: "$5" },
            { rank: "4-10", amount: "$3" },
            { rank: "11-20", amount: "$1" }
        ],
        memorama: [
            { rank: 1, amount: "$20" },
            { rank: 2, amount: "$10" },
            { rank: 3, amount: "$5" },
            { rank: "4-10", amount: "$3" },
            { rank: "11-20", amount: "$1" }
        ],
        coinClick: [
            { rank: 1, amount: "$20" },
            { rank: 2, amount: "$10" },
            { rank: 3, amount: "$5" },
            { rank: "4-10", amount: "$3" },
            { rank: "11-20", amount: "$1" }
        ],
        flappyBird: [
            { rank: 1, amount: "$20" },
            { rank: 2, amount: "$10" },
            { rank: 3, amount: "$5" },
            { rank: "4-10", amount: "$3" },
            { rank: "11-20", amount: "$1" }
        ],
        spacingLayer: [
            { rank: 1, amount: "$20" },
            { rank: 2, amount: "$10" },
            { rank: 3, amount: "$5" },
            { rank: "4-10", amount: "$3" },
            { rank: "11-20", amount: "$1" }
        ],
    };

    useEffect(() => {
        const loadData = () => {
            setIsLoading(true);
            
            // Datos hardcodeados para cada juego
            const generateMockData = (baseScores: number[]): LeaderboardData[] => {
                const usernames = ['Player1', 'GameMaster', 'ProGamer', 'SkillKing', 'TopPlayer', 
                                 'Champion', 'Elite', 'Legend', 'Master', 'Ace'];
                
                return baseScores.map((score, index) => ({
                    rank: index + 1,
                    userId: index + 1,
                    username: usernames[index],
                    score: score,
                    isCurrentUser: currentUserId === index + 1
                }));
            };

            // Snake - puntos más altos
            setSnakeData(generateMockData([15000, 12500, 10800, 9500, 8200, 7800, 6900, 6200, 5500, 4800]));
            
            // Memorama - tiempo en segundos (menor es mejor, pero mostramos como puntos)
            setMemoramaData(generateMockData([8500, 7200, 6800, 6200, 5900, 5400, 5100, 4800, 4500, 4200]));
            
            // Coin Clicker - clicks por minuto
            setCoinClickData(generateMockData([25000, 22000, 19500, 17800, 16200, 15000, 13800, 12500, 11200, 10000]));
            
            // Flappy Bird - distancia recorrida
            setFlappyBirdData(generateMockData([9800, 8500, 7800, 7200, 6800, 6200, 5800, 5300, 4900, 4500]));
            
            // Spacing Layer - niveles completados
            setSpacingLayerData(generateMockData([12000, 10500, 9800, 8900, 8200, 7600, 7100, 6500, 6000, 5500]));
            
            setIsLoading(false);
        };

        loadData();
    }, [currentUserId]);

    const renderUserStats = () => {
        if (!isDashboard || !currentUserId) return null;

        const getDataForType = (type: string): LeaderboardData[] => {
            switch(type) {
                case 'snake': return snakeData;
                case 'memorama': return memoramaData;
                case 'coinClick': return coinClickData;
                case 'flappyBird': return flappyBirdData;
                case 'spacingLayer': return spacingLayerData;
                default: return [];
            }
        };

        const currentData = getDataForType(activeLeaderboardType);
        const userInfo = currentData?.find((user: LeaderboardData) => user.userId === currentUserId || user.isCurrentUser);
        
        if (!userInfo) return null;
        
        return (
            <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0F172A] rounded-lg p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">Your Rank</p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {userInfo.rank > 50 ? '50+' : userInfo.rank}
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-[#F59E0B]/20">
                                <Trophy className="w-6 h-6 text-[#F59E0B]" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0F172A] rounded-lg p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">High Score</p>
                                <p className="text-3xl font-bold text-white mt-2">{userInfo.score.toLocaleString()}</p>
                            </div>
                            <div className="p-2 rounded-full bg-[#6366F1]/20">
                                <Trophy className="w-6 h-6 text-[#6366F1]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLeaderboardTable = () => {
        const getDataForType = (type: string): LeaderboardData[] => {
            switch(type) {
                case 'snake': return snakeData;
                case 'memorama': return memoramaData;
                case 'coinClick': return coinClickData;
                case 'flappyBird': return flappyBirdData;
                case 'spacingLayer': return spacingLayerData;
                default: return [];
            }
        };

        const data = getDataForType(activeLeaderboardType);
        const typeConfig = leaderboardTypes.find(t => t.id === activeLeaderboardType);
        
        if (isLoading) {
            return (
                <div className="p-8 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading leaderboard...</p>
                </div>
            );
        }
        
        if (!data || data.length === 0) {
            return (
                <div className="p-8 text-center">
                    <p className="text-gray-300">No data available to display.</p>
                </div>
            );
        }
        
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-gray-700">
                            <th className="py-4 px-4 text-gray-400">Rank</th>
                            <th className="py-4 px-4 text-gray-400">User</th>
                            <th className="py-4 px-4 text-gray-400 text-right">High Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user: LeaderboardData) => (
                            <tr 
                                key={user.rank}
                                className={`border-b border-gray-700/50 hover:bg-[#0F172A]/50 transition-colors ${
                                    (isDashboard && (user.userId === currentUserId || user.isCurrentUser)) 
                                        ? 'bg-[#6366F1]/10 border-l-4 border-l-[#6366F1]' 
                                        : user.rank === 1 ? 'bg-[#F59E0B]/10' : ''
                                }`}
                            >
                                <td className="py-4 px-4">
                                    {user.rank <= 3 ? (
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full 
                                            ${user.rank === 1 ? 'bg-yellow-500' : 
                                              user.rank === 2 ? 'bg-gray-300' : 'bg-amber-700'} 
                                            text-gray-900 font-bold`}
                                        >
                                            {user.rank}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 font-medium">
                                            {user.rank > 50 ? '50+' : user.rank}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-[#2D3748] flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className={`font-medium ${
                                            (isDashboard && (user.userId === currentUserId || user.isCurrentUser)) 
                                                ? 'text-[#6366F1]' 
                                                : 'text-white'
                                        }`}>
                                            {(isDashboard && (user.userId === currentUserId || user.isCurrentUser)) 
                                                ? 'You' 
                                                : user.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <span className={`font-bold ${
                                        user.rank === 1 ? 'text-[#F59E0B]' : 
                                        user.rank <= 3 ? 'text-[#10B981]' : 'text-gray-300'
                                    }`}>
                                        {user.score.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Leaderboard Type Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
                {leaderboardTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setActiveLeaderboardType(type.id)}
                        className={`px-5 py-3 rounded-lg flex items-center transition-all`}
                        style={{ 
                            backgroundColor: activeLeaderboardType === type.id ? type.color : '#1E293B',
                            color: activeLeaderboardType === type.id ? 'white' : '#CBD5E0',
                        }}
                    >
                        <type.icon className="w-5 h-5 mr-2" />
                        {type.name}
                    </button>
                ))}
            </div>
            
            {/* User Stats (only in dashboard) */}
            {renderUserStats()}
            
            {/* Leaderboard Table */}
            <div className="bg-[#1E293B] rounded-xl shadow-lg overflow-hidden border border-[#334155]">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-center">
                        <h2 className="text-2xl font-bold text-white">
                            {leaderboardTypes.find(t => t.id === activeLeaderboardType)?.name}
                        </h2>
                    </div>
                </div>
                
                <div className="p-4">
                    {renderLeaderboardTable()}
                </div>
            </div>
            
            {/* Call to Action */}
            {!isDashboard && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mt-12 bg-[#1E293B] p-8 rounded-xl shadow-lg text-center border border-[#334155]"
                >
                    <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
                        Join the Competition!
                    </h3>
                    <div className="flex justify-center items-center space-x-6">
                        <ArrowUpRight className="w-16 h-16 text-[#10B981]" />
                        <p className="text-xl text-gray-300 max-w-2xl">
                            Play our games and compete for the top spots! 
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Leaderboard; 