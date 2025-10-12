'use client'
import React from 'react';
import Leaderboard from '@/components/ui/leaderboard/Leaderboard';

const LeaderboardPage = () => {
    return (
        <section className="py-12 bg-[#0F172A]">
            <div className="bg-[#1E293B]/80 py-16 mb-12 text-center">
                <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
                    Leaderboard
                </h1>
                <p className="text-[#6366F1] text-xl font-medium">
                    Top players in the MinijuegosTiesos community
                </p>
            </div>

            <Leaderboard />
        </section>
    );
};

export default LeaderboardPage; 