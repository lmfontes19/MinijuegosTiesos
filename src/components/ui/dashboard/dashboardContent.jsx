// components/Dashboard/DashboardContent.js
'use client'
import { useState, useEffect } from 'react';
import { Wallet, Zap, ClipboardCheck, DollarSign, Calendar, PieChart, Users, History, Award, AlertTriangle, Gamepad2, Trophy, Star } from 'lucide-react';
import { useGameHighScores } from '@/hooks/useGameHighScores';

export const DashboardContent = () => {
  const { highScores } = useGameHighScores();
  const [recentActivity, setRecentActivity] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [earningsData, setEarningsData] = useState({
    today: { value: 0, trend: "neutral" },
    week: { value: 0, trend: "neutral" },
    month: { value: 0, trend: "neutral" },
    total: { value: 0, trend: "neutral" }
  });
  const [userStats, setUserStats] = useState({ balance: 0, tasksCompleted: 0, clicksCompleted: 0 });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState({
    recentActivity: true,
    referralStats: true,
    userStats: true
  });

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);

    // Fetch data from backend
    const fetchDashboardData = async () => {
      try {
        const CTtoken = localStorage.getItem('CTtoken');

        // Fetch balance
        const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/balance`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CTtoken}`,
          },
        });
        const balanceData = await balanceResponse.json();

        // Fetch recent activity
        const activityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/recent-activity`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CTtoken}`,
          },
        });
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
        setLoading(prev => ({ ...prev, recentActivity: false }));

        // Fetch completions
        const completionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/completions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CTtoken}`,
          },
        });
        const completionsData = await completionsResponse.json();
        setUserStats({
          ...completionsData,
          balance: balanceData.balance
        });
        setLoading(prev => ({ ...prev, userStats: false }));

        // Fetch earnings
        const earningsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/earnings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CTtoken}`,
          },
        });
        const earningsData = await earningsResponse.json();
        setEarningsData({
          today: { value: earningsData.today, trend: "neutral" },
          week: { value: earningsData.week, trend: "neutral" },
          month: { value: earningsData.month, trend: "neutral" },
          total: { value: earningsData.total, trend: "neutral" }
        });

        // Fetch referral stats
        const referralsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/referrals`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CTtoken}`,
          },
        });
        const referralsData = await referralsResponse.json();
        setReferralStats({
          refLink: `https://minijuegostiesos.com/?ref=${storedUserId}`,
          totalReferrals: referralsData.totalReferrals,
          totalEarnings: referralsData.totalEarnings,
          referrals: referralsData.referrals
        });
        setLoading(prev => ({ ...prev, referralStats: false }));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading({
          recentActivity: false,
          referralStats: false,
          userStats: false
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (dateString === 'never') return 'Never';
    if (dateString === 'no_withdrawals_yet') return 'No withdrawals yet';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate time ago
  const timeAgo = (dateString) => {
    if (dateString === 'never') return 'Never';
    if (dateString === 'no_withdrawals_yet') return 'No withdrawals yet';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Loading state for stats cards
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
    </div>
  );

  // Get referrals sorted by earnings
  const getSortedReferrals = () => {
    if (!referralStats || !referralStats.referrals || referralStats.referrals.length === 0) {
      return null;
    }

    // Sort referrals by earnings in descending order and take only top 5
    return [...referralStats.referrals]
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
  };

  const sortedReferrals = referralStats ? getSortedReferrals() : null;

  // Determine if we have referrals to show
  const hasReferrals = sortedReferrals && sortedReferrals.length > 0;

  return (
    <div className="max-w-full overflow-hidden">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">BALANCE (USD)</p>
              {loading.userStats ? (
                <LoadingSpinner />
              ) : (
                <p className="text-2xl font-bold text-[#6366F1] mt-1">${userStats.balance.toFixed(2)}</p>
              )}
            </div>
            <div className="bg-[#6366F1]/10 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-[#6366F1]" />
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">CLICKS COMPLETED</p>
              {loading.userStats ? (
                <LoadingSpinner />
              ) : (
                <p className="text-2xl font-bold text-[#10B981] mt-1">{userStats.clicksCompleted}</p>
              )}
            </div>
            <div className="bg-[#10B981]/10 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">TASKS COMPLETED</p>
              {loading.userStats ? (
                <LoadingSpinner />
              ) : (
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">{userStats.tasksCompleted}</p>
              )}
            </div>
            <div className="bg-[#F59E0B]/10 p-2 rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>

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
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Coin Clicker</h4>
              <p className="text-2xl font-bold text-[#6366F1]">{highScores.coinClicker.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Coins</p>
            </div>

            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155] group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-[#10B981]/10 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-[#10B981]" />
                </div>
                <Star className="w-4 h-4 text-yellow-400" />
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
                <Star className="w-4 h-4 text-yellow-400" />
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
                <Star className="w-4 h-4 text-yellow-400" />
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
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Spacing Layer</h4>
              <p className="text-2xl font-bold text-[#8B5CF6]">{highScores.spacingLayer}</p>
              <p className="text-xs text-gray-400 mt-1">Level</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Your Recent Earnings Section */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300 mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-400" />
          Your Recent Earnings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <div className="flex justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Today
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earningsData.today.value.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <div className="flex justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> This Week
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earningsData.week.value.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <div className="flex justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> This Month
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earningsData.month.value.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#334155]">
            <div className="flex justify-between mb-2">
              <p className="text-gray-400 text-xs font-medium flex items-center">
                <PieChart className="w-3 h-3 mr-1" /> Total
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earningsData.total.value.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout for Recent Activity and Referral Stats */}
      <div className="flex flex-col gap-6 mb-6">
        {/* Recent Activity Section */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-white font-medium mb-3 uppercase flex items-center">
            <History className="w-4 h-4 mr-2 text-[#F59E0B]" /> Recent Activity
          </h3>

          {loading.recentActivity ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F59E0B]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#0F172A]/40 rounded-lg p-3 border border-[#334155]/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">Last Login</h4>
                    <p className="text-gray-300 text-sm mt-1">{formatDate(recentActivity.lastLogin)}</p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-full">
                    {timeAgo(recentActivity.lastLogin)}
                  </div>
                </div>
              </div>

              <div className="bg-[#0F172A]/40 rounded-lg p-3 border border-[#334155]/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">Last Cash Out</h4>
                    <p className="text-gray-300 text-sm mt-1">{formatDate(recentActivity.lastCashOut)}</p>
                  </div>
                  <div className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    {timeAgo(recentActivity.lastCashOut)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referral Stats Section */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-white font-medium mb-3 uppercase flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#10B981]" /> Referral Stats
          </h3>

          {loading.referralStats ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10B981]"></div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0F172A]/40 p-3 rounded-lg border border-[#334155]">
                  <p className="text-gray-400 text-xs">Total Referrals</p>
                  <p className="text-lg font-bold text-white">{referralStats.totalReferrals}</p>
                </div>

                <div className="bg-[#0F172A]/40 p-3 rounded-lg border border-[#334155]">
                  <p className="text-gray-400 text-xs">Total Earnings</p>
                  <p className="text-lg font-bold text-[#10B981]">${referralStats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>

              {/* Top Referrals Section - Shows only if there's at least 1 referral */}
              {hasReferrals ? (
                <div className="mt-4 flex-grow">
                  <h4 className="text-white font-medium mb-3 flex items-center text-sm">
                    <Award className="w-4 h-4 mr-2 text-yellow-400" /> Top Referrals
                  </h4>
                  <div className="bg-[#0F172A]/40 rounded-lg border border-[#334155]/50 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#334155]/50">
                          <th className="text-left p-2 text-xs text-gray-400 font-medium">Rank</th>
                          <th className="text-left p-2 text-xs text-gray-400 font-medium">Username</th>
                          <th className="text-right p-2 text-xs text-gray-400 font-medium">Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/30">
                        {sortedReferrals.map((referral, index) => (
                          <tr key={referral.id}>
                            <td className="p-2 text-sm text-white">#{index + 1}</td>
                            <td className="p-2 text-sm text-white">{referral.username}</td>
                            <td className="p-2 text-sm text-right text-[#10B981]">${referral.earnings.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-4 bg-[#0F172A]/40 rounded-lg border border-[#334155]/50">
                  <p className="text-gray-400 text-sm">No referrals yet</p>
                  <p className="text-xs text-gray-500 mt-1">Share your referral link to start earning!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};