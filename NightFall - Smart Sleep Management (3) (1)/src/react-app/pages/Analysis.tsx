import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrendingUp, Moon, Clock, Star, Brain, Target, Calendar } from 'lucide-react';
import type { SleepSession, SleepAnalysis } from '@/shared/types';

export default function Analysis() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [sleepAnalysis, setSleepAnalysis] = useState<SleepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [sessionsResponse, analysisResponse] = await Promise.all([
        fetch('/api/sleep-sessions'),
        fetch('/api/sleep-analysis')
      ]);

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSleepSessions(sessionsData);
      }

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setSleepAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for charts if no real data exists
  const weeklyData = sleepSessions.length > 0 
    ? sleepSessions.slice(0, 7).reverse().map((session, index) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index] || `Day ${index + 1}`,
        score: session.sleep_score || 0,
        duration: session.sleep_duration_minutes ? Math.round(session.sleep_duration_minutes / 60 * 10) / 10 : 0,
        quality: session.sleep_quality_rating || 3
      }))
    : [
        { day: 'Sunday', score: 75, duration: 7.2, quality: 4 },
        { day: 'Monday', score: 82, duration: 7.8, quality: 4 },
        { day: 'Tuesday', score: 68, duration: 6.5, quality: 3 },
        { day: 'Wednesday', score: 90, duration: 8.1, quality: 5 },
        { day: 'Thursday', score: 85, duration: 7.6, quality: 4 },
        { day: 'Friday', score: 78, duration: 7.3, quality: 4 },
        { day: 'Saturday', score: 88, duration: 8.2, quality: 5 },
      ];

  const sleepPhaseData = [
    { name: 'Deep Sleep', value: 25, color: '#8b5cf6' },
    { name: 'Light Sleep', value: 50, color: '#a855f7' },
    { name: 'REM Sleep', value: 20, color: '#ec4899' },
    { name: 'Awake', value: 5, color: '#6366f1' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Moon className="w-12 h-12 text-white mx-auto" />
            </div>
            <p className="text-purple-200">Analyzing your data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const averageScore = sleepAnalysis?.averageSleepScore || Math.round(weeklyData.reduce((acc, day) => acc + day.score, 0) / weeklyData.length);
  const averageDuration = sleepAnalysis?.averageSleepDuration || Math.round(weeklyData.reduce((acc, day) => acc + day.duration, 0) / weeklyData.length * 60);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Sleep Analysis</h1>
          <p className="text-purple-200">Detailed report on your sleep quality and improvement recommendations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-purple-300" />
              <span className="text-2xl font-bold text-white">{averageScore}</span>
            </div>
            <h3 className="text-purple-200 text-sm">Sleep Quality Score</h3>
            <p className="text-xs text-purple-300 mt-1">Last 30 days average</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-indigo-300" />
              <span className="text-2xl font-bold text-white">
                {Math.floor(averageDuration / 60)}h {averageDuration % 60}m
              </span>
            </div>
            <h3 className="text-purple-200 text-sm">Sleep Average</h3>
            <p className="text-xs text-purple-300 mt-1">Hours of sleep daily</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-pink-300" />
              <span className="text-2xl font-bold text-white">
                {sleepAnalysis?.weeklyComparison.change || '+5'}
              </span>
            </div>
            <h3 className="text-purple-200 text-sm">Weekly Improvement</h3>
            <p className="text-xs text-purple-300 mt-1">Compared to last week</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-300" />
              <span className="text-2xl font-bold text-white">
                {Math.round((averageScore / 100) * 100)}%
              </span>
            </div>
            <h3 className="text-purple-200 text-sm">Goal Achieved</h3>
            <p className="text-xs text-purple-300 mt-1">Of 8 hours sleep goal</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Sleep Score Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart className="w-5 h-5 text-purple-400 mr-2" />
              Weekly Sleep Scores
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Phases Pie Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              Sleep Phases
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sleepPhaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sleepPhaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sleepPhaseData.map((phase, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: phase.color }}
                  ></div>
                  <span className="text-purple-200">{phase.name}</span>
                  <span className="text-white font-semibold">{phase.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Before vs After */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-purple-400 mr-2" />
              Before vs After Using App
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-purple-200 text-sm mb-2">Before Usage</h3>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-red-400 mb-1">65</div>
                  <div className="text-xs text-purple-200">Sleep Score</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 mt-2">
                  <div className="text-2xl font-bold text-red-400 mb-1">6.2h</div>
                  <div className="text-xs text-purple-200">Sleep Average</div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-purple-200 text-sm mb-2">After Usage</h3>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">{averageScore}</div>
                  <div className="text-xs text-purple-200">Sleep Score</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 mt-2">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {Math.floor(averageDuration / 60)}.{Math.round((averageDuration % 60) / 60 * 10)}h
                  </div>
                  <div className="text-xs text-purple-200">Sleep Average</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-green-500/20 rounded-xl p-4">
                <div className="text-green-400 font-semibold text-lg">
                  {Math.round(((averageScore - 65) / 65) * 100)}% Improvement
                </div>
                <div className="text-purple-200 text-sm mt-1">in overall sleep quality</div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              AI Recommendations
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-500/20 rounded-xl p-4">
                <h3 className="text-blue-400 font-semibold mb-2">🧠 Improve Sleep Quality</h3>
                <p className="text-purple-200 text-sm">
                  Based on your data analysis, we recommend reducing screen time one hour before bed to improve deep sleep.
                </p>
              </div>

              <div className="bg-green-500/20 rounded-xl p-4">
                <h3 className="text-green-400 font-semibold mb-2">⏰ Optimal Sleep Timing</h3>
                <p className="text-purple-200 text-sm">
                  Your optimal bedtime is 10:30 PM to get 8 hours of high-quality sleep.
                </p>
              </div>

              <div className="bg-purple-500/20 rounded-xl p-4">
                <h3 className="text-purple-400 font-semibold mb-2">🎵 Suitable Sounds</h3>
                <p className="text-purple-200 text-sm">
                  Rain and nature sounds suit your sleep pattern better than white noise.
                </p>
              </div>

              <div className="bg-pink-500/20 rounded-xl p-4">
                <h3 className="text-pink-400 font-semibold mb-2">🏆 Weekly Goal</h3>
                <p className="text-purple-200 text-sm">
                  Try to reach an average of 85 sleep quality points in the next week.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Report */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Daily Report</h2>
          <p className="text-purple-200 text-lg mb-6 leading-relaxed">
            Your sleep has improved significantly since using the app. Keep following the recommendations and maintaining a healthy sleep routine.
          </p>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            "Sleep Better, Live Better 🌙"
          </div>
          <p className="text-purple-300">
            Share your progress with friends and help them improve their sleep too
          </p>
        </div>
      </div>
    </Layout>
  );
}
