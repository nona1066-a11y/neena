import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import SleepChart from '@/react-app/components/SleepChart';
import QuickActions from '@/react-app/components/QuickActions';
import SleepStats from '@/react-app/components/SleepStats';
import { Moon, TrendingUp, Clock, Star, Loader2 } from 'lucide-react';
import type { SleepAnalysis } from '@/shared/types';

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [sleepAnalysis, setSleepAnalysis] = useState<SleepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchSleepAnalysis();
    }
  }, [user]);

  const fetchSleepAnalysis = async () => {
    try {
      const response = await fetch('/api/sleep-analysis');
      if (response.ok) {
        const data = await response.json();
        setSleepAnalysis(data);
      }
    } catch (error) {
      console.error('Failed to fetch sleep analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-purple-200">Loading your data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    if (hour >= 18 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {getGreeting()}, {user?.google_user_data.given_name || 'friend'}
                </h1>
                <p className="text-purple-200">
                  Current time: {getCurrentTime()} - How was your sleep last night?
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">
                    Sleep Score: {sleepAnalysis?.averageSleepScore || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-200 text-sm">
                    Average Sleep: {Math.round((sleepAnalysis?.averageSleepDuration || 0) / 60)}h {Math.round((sleepAnalysis?.averageSleepDuration || 0) % 60)}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Sleep Quality</p>
                <p className="text-2xl font-bold text-white">{sleepAnalysis?.averageSleepScore || 0}%</p>
              </div>
              <Moon className="w-8 h-8 text-purple-300" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${sleepAnalysis?.averageSleepScore || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Trend</p>
                <p className="text-xl font-bold text-white">
                  {sleepAnalysis?.sleepTrend === 'improving' ? 'Improving' : 
                   sleepAnalysis?.sleepTrend === 'declining' ? 'Declining' : 'Stable'}
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${
                sleepAnalysis?.sleepTrend === 'improving' ? 'text-green-400' :
                sleepAnalysis?.sleepTrend === 'declining' ? 'text-red-400' : 'text-yellow-400'
              }`} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">{sleepAnalysis?.weeklyComparison.thisWeek || 0}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  (sleepAnalysis?.weeklyComparison.change || 0) > 0 ? 'text-green-400' : 
                  (sleepAnalysis?.weeklyComparison.change || 0) < 0 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {(sleepAnalysis?.weeklyComparison.change || 0) > 0 ? '+' : ''}{sleepAnalysis?.weeklyComparison.change || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Sleep Average</p>
                <p className="text-2xl font-bold text-white">
                  {Math.floor((sleepAnalysis?.averageSleepDuration || 0) / 60)}h {Math.round((sleepAnalysis?.averageSleepDuration || 0) % 60)}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sleep Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Sleep Quality Chart</h2>
            <SleepChart />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <QuickActions />
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Sleep Statistics</h2>
              <SleepStats analysis={sleepAnalysis} />
            </div>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">💡 Today's Tip</h3>
            <p className="text-purple-200">
              Try to go to bed and wake up at the same time every day, even on weekends. This helps regulate your internal biological clock.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
